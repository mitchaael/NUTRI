# Requisitos de Google Play — plazo 31 de agosto de 2026

Google Play envió dos avisos para `cl.caloru.app`. Los dos vencen el
**31 de agosto de 2026** y los dos se arreglan en el **proyecto Android (TWA)**,
no en este repo.

| Aviso | Qué pide | Dónde se arregla |
|---|---|---|
| Biblioteca de Facturación desactualizada | Play Billing Library **8 o superior** | `build.gradle` del TWA |
| Nivel de API objetivo desactualizado | `targetSdkVersion` **36** (Android 16) | `build.gradle` del TWA |

Si no alcanzas, Google permite pedir una **extensión hasta el 1 de noviembre de 2026**
desde Play Console. La app publicada sigue funcionando; lo que se bloquea es
**publicar actualizaciones nuevas**.

---

## Contexto: cómo está armada la app Android

Calorú en Play Store es una **TWA (Trusted Web Activity)** — un contenedor Android
que abre `caloru.cl`. Se nota en:

- `public/.well-known/assetlinks.json` → declara el paquete `cl.caloru.app`
- `App.jsx` → los pagos usan la **Digital Goods API** (`window.getDigitalGoodsService`),
  que es la forma en que una TWA habla con Play Billing

El proyecto Android (generado con Bubblewrap o PWABuilder) **no está versionado
en este repositorio**. Vive en la máquina donde se generó el AAB. Los dos cambios
de abajo se hacen ahí.

---

## 1. Actualizar Play Billing Library a 8+

En una TWA no se usa `com.android.billingclient` directamente: la versión de
Play Billing la determina **Android Browser Helper**. Basta con subir esa
dependencia.

### Opción A — con Bubblewrap (recomendada)

```bash
npm update -g @bubblewrap/cli
cd <carpeta-del-proyecto-twa>
bubblewrap update      # actualiza Android Browser Helper y el gradle del proyecto
bubblewrap build       # regenera el AAB firmado
```

`bubblewrap update` es lo que trae la versión de ABH que empaqueta Play Billing 8+.
Si `bubblewrap build` pide el keystore, es el mismo `.keystore` con el que se
firmó la app originalmente — sin él Play rechaza el AAB.

### Opción B — editando el gradle a mano

En `app/build.gradle`, sube la dependencia de billing a la última disponible:

```gradle
dependencies {
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:<última>'
    implementation 'com.google.androidbrowserhelper:billing:<última>'
}
```

Verifica cuál es la última en
[Maven Central](https://central.sonatype.com/artifact/com.google.androidbrowserhelper/billing)
antes de fijar el número — hay que quedar en una que empaquete Play Billing **8 o superior**.

### Sobre `ProrationMode`

Play Billing 8 eliminó `ProrationMode` y lo reemplazó por `ReplacementMode`.
**Calorú no se ve afectada**: el código de `App.jsx` no usa proration — solo
`getDetails()` + `PaymentRequest`, que no cambiaron.

---

## 2. Actualizar targetSdkVersion a 36

En `app/build.gradle` del proyecto TWA:

```gradle
android {
    compileSdkVersion 36
    defaultConfig {
        targetSdkVersion 36     // Android 16 — requisito Play desde 31-ago-2026
        minSdkVersion 21        // dejar como está
    }
}
```

Con Bubblewrap, `bubblewrap update` normalmente ya deja `targetSdkVersion` al día;
igual conviene abrir el `build.gradle` y confirmarlo antes de compilar.

### Qué revisar después de subir a API 36

Android 16 aplica cambios que afectan sobre todo a apps nativas. En una TWA el
riesgo es bajo, pero conviene probar en un dispositivo con Android 16:

- **Edge-to-edge obligatorio**: Android 16 fuerza pantalla completa y ya no se
  puede desactivar. Revisar que el contenido no quede bajo la barra de estado ni
  bajo la barra de navegación — es decir, que los `env(safe-area-inset-*)` del CSS
  estén haciendo su trabajo.
- **Notificaciones push**: confirmar que el permiso `POST_NOTIFICATIONS` se sigue
  pidiendo bien (la app usa push vía `send-push`).
- **Flujo de pago completo**: comprar, cancelar a mitad de camino, y reinstalar la
  app para verificar que la suscripción se restaura.

---

## 3. Subir la nueva versión

```bash
# En el proyecto TWA, subir versionCode antes de compilar
bubblewrap build
```

Luego en Play Console: **Producción → Crear versión → subir el AAB**.
Los dos avisos del panel desaparecen una vez que Google procesa el bundle nuevo.

---

## Cambios que sí se hicieron en este repo

Al revisar la integración de Play Billing aparecieron tres problemas reales en el
código de pagos. Van corregidos junto con esta guía:

1. **Faltaba el `acknowledge` de la compra** (`supabase/functions/verify-play-purchase`).
   Google exige acusar recibo dentro de **72 horas**; si no, **reembolsa
   automáticamente al usuario y revoca la compra**. Toda suscripción vendida por
   Play se estaba perdiendo a los 3 días.
2. **El JWT de la service account se firmaba con base64 estándar** en vez de
   base64url. Google rechaza ese formato, así que la verificación contra Play
   fallaba cuando la firma contenía `+` o `/`.
3. **Se usaba `purchases.subscriptions`**, la API v1 obsoleta. Ahora se usa
   `purchases.subscriptionsv2`, que además permite validar el `productId` que
   reporta Google en vez de confiar en el SKU que manda el cliente, y entrega la
   fecha real de expiración.

También en `App.jsx`: si el usuario ya tiene una compra en su cuenta de Play
(reinstalación, o una verificación que falló antes), ahora se restaura en vez de
cobrarle de nuevo; y cerrar la hoja de pago ya no muestra un mensaje de error.

---

## Fuentes

- [Meet Google Play's target API level requirement](https://developer.android.com/google/play/requirements/target-sdk)
- [Google Play Billing Library version deprecation](https://developer.android.com/google/play/billing/deprecation-faq)
- [Migrate to Google Play Billing Library 8](https://developer.android.com/google/play/billing/migrate-gpblv8)
- [Receive Payments via Google Play Billing with the Digital Goods API](https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing)
- [Method: purchases.subscriptions.acknowledge](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptions/acknowledge)
- [Method: purchases.subscriptionsv2.get](https://developers.google.com/android-publisher/api-ref/rest/v3/purchases.subscriptionsv2/get)
