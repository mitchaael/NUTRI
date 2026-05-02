import { useState, useMemo, useEffect } from "react";

/* ═══════════════════════════════════════════
   DATABASE — 138 productos chilenos
═══════════════════════════════════════════ */
const DB = [
  {id:1,  nombre:"Leche entera Soprole (250ml)",         marca:"Soprole",    cat:"Lácteos",    cal:160, prot:8,   carbs:12,  grasas:9,   fibra:0,   emoji:"🥛"},
  {id:2,  nombre:"Leche semidescremada Soprole (250ml)", marca:"Soprole",    cat:"Lácteos",    cal:120, prot:9,   carbs:12,  grasas:4.5, fibra:0,   emoji:"🥛"},
  {id:3,  nombre:"Leche descremada Soprole (250ml)",     marca:"Soprole",    cat:"Lácteos",    cal:90,  prot:9,   carbs:12,  grasas:0.5, fibra:0,   emoji:"🥛"},
  {id:4,  nombre:"Yogurt Soprole natural (150g)",        marca:"Soprole",    cat:"Lácteos",    cal:120, prot:7,   carbs:14,  grasas:4,   fibra:0,   emoji:"🥣"},
  {id:5,  nombre:"Yogurt Soprole fruta (150g)",          marca:"Soprole",    cat:"Lácteos",    cal:140, prot:6,   carbs:20,  grasas:3.5, fibra:0,   emoji:"🥣"},
  {id:6,  nombre:"Yogurt Soprole 0% grasa (150g)",       marca:"Soprole",    cat:"Lácteos",    cal:80,  prot:8,   carbs:12,  grasas:0,   fibra:0,   emoji:"🥣"},
  {id:7,  nombre:"Crema Soprole (100ml)",                marca:"Soprole",    cat:"Lácteos",    cal:330, prot:2.5, carbs:3,   grasas:35,  fibra:0,   emoji:"🫙"},
  {id:8,  nombre:"Margarina Soprole (5g)",               marca:"Soprole",    cat:"Lácteos",    cal:30,  prot:0,   carbs:0,   grasas:3.5, fibra:0,   emoji:"🧈"},
  {id:9,  nombre:"Leche entera Colun (250ml)",           marca:"Colun",      cat:"Lácteos",    cal:155, prot:8,   carbs:11,  grasas:8.5, fibra:0,   emoji:"🥛"},
  {id:10, nombre:"Queso gauda Colun (30g)",              marca:"Colun",      cat:"Lácteos",    cal:105, prot:7,   carbs:0.5, grasas:8.5, fibra:0,   emoji:"🧀"},
  {id:11, nombre:"Queso chanco Colun (30g)",             marca:"Colun",      cat:"Lácteos",    cal:95,  prot:6,   carbs:1,   grasas:8,   fibra:0,   emoji:"🧀"},
  {id:12, nombre:"Queso mantecoso Colun (30g)",          marca:"Colun",      cat:"Lácteos",    cal:100, prot:6,   carbs:1,   grasas:8,   fibra:0,   emoji:"🧀"},
  {id:13, nombre:"Manjar Colun (15g)",                   marca:"Colun",      cat:"Lácteos",    cal:55,  prot:1,   carbs:12,  grasas:0.5, fibra:0,   emoji:"🍯"},
  {id:14, nombre:"Mantequilla Colun (5g)",               marca:"Colun",      cat:"Lácteos",    cal:35,  prot:0.1, carbs:0,   grasas:4,   fibra:0,   emoji:"🧈"},
  {id:15, nombre:"Leche Loncoleche entera (250ml)",      marca:"Loncoleche", cat:"Lácteos",    cal:158, prot:8,   carbs:12,  grasas:9,   fibra:0,   emoji:"🥛"},
  {id:16, nombre:"Yogurt Colun fruta (150g)",            marca:"Colun",      cat:"Lácteos",    cal:145, prot:6,   carbs:21,  grasas:3.5, fibra:0,   emoji:"🥣"},
  {id:17, nombre:"Yogurt Nestlé LC1 (150g)",             marca:"Nestlé",     cat:"Lácteos",    cal:110, prot:7,   carbs:16,  grasas:2,   fibra:0,   emoji:"🥣"},
  {id:18, nombre:"Yogurt griego Danone (150g)",          marca:"Danone",     cat:"Lácteos",    cal:135, prot:10,  carbs:13,  grasas:4,   fibra:0,   emoji:"🥣"},
  {id:19, nombre:"Queso crema Philadelphia (30g)",       marca:"Kraft",      cat:"Lácteos",    cal:90,  prot:2,   carbs:1.5, grasas:9,   fibra:0,   emoji:"🧀"},
  {id:20, nombre:"Pechuga pollo Ariztía (100g)",         marca:"Ariztía",    cat:"Carnes",     cal:110, prot:23,  carbs:0,   grasas:1.5, fibra:0,   emoji:"🍗"},
  {id:21, nombre:"Trutro pollo Ariztía (100g)",          marca:"Ariztía",    cat:"Carnes",     cal:185, prot:18,  carbs:0,   grasas:12,  fibra:0,   emoji:"🍗"},
  {id:22, nombre:"Hamburguesa pollo Ariztía (85g)",      marca:"Ariztía",    cat:"Carnes",     cal:190, prot:14,  carbs:5,   grasas:13,  fibra:0,   emoji:"🍔"},
  {id:23, nombre:"Pechuga Super Pollo (100g)",           marca:"Super Pollo",cat:"Carnes",     cal:108, prot:22,  carbs:0,   grasas:2,   fibra:0,   emoji:"🍗"},
  {id:24, nombre:"Lomo de vacuno (100g)",                marca:"Natural",    cat:"Carnes",     cal:215, prot:26,  carbs:0,   grasas:12,  fibra:0,   emoji:"🥩"},
  {id:25, nombre:"Filete de vacuno (100g)",              marca:"Natural",    cat:"Carnes",     cal:175, prot:27,  carbs:0,   grasas:7,   fibra:0,   emoji:"🥩"},
  {id:26, nombre:"Carne molida 80% (100g)",              marca:"Natural",    cat:"Carnes",     cal:255, prot:17,  carbs:0,   grasas:20,  fibra:0,   emoji:"🥩"},
  {id:27, nombre:"Cerdo chuleta (100g)",                 marca:"Natural",    cat:"Carnes",     cal:195, prot:24,  carbs:0,   grasas:10,  fibra:0,   emoji:"🥩"},
  {id:28, nombre:"Vienesa San Jorge (40g)",              marca:"San Jorge",  cat:"Cecinas",    cal:130, prot:6,   carbs:2,   grasas:11,  fibra:0,   emoji:"🌭"},
  {id:29, nombre:"Jamón de pavo San Jorge (25g)",        marca:"San Jorge",  cat:"Cecinas",    cal:30,  prot:5.5, carbs:0.5, grasas:0.7, fibra:0,   emoji:"🥩"},
  {id:30, nombre:"Mortadela San Jorge (25g)",            marca:"San Jorge",  cat:"Cecinas",    cal:70,  prot:4,   carbs:2,   grasas:5.5, fibra:0,   emoji:"🥩"},
  {id:31, nombre:"Salame Montserrat (30g)",              marca:"Montserrat", cat:"Cecinas",    cal:110, prot:7,   carbs:0.5, grasas:9,   fibra:0,   emoji:"🥩"},
  {id:32, nombre:"Jamón serrano Montserrat (25g)",       marca:"Montserrat", cat:"Cecinas",    cal:55,  prot:7,   carbs:0,   grasas:3,   fibra:0,   emoji:"🥩"},
  {id:33, nombre:"Vienesa Otto Kunkel (40g)",            marca:"Otto Kunkel",cat:"Cecinas",    cal:135, prot:6,   carbs:2,   grasas:11.5,fibra:0,   emoji:"🌭"},
  {id:34, nombre:"Paté hígado Montserrat (30g)",         marca:"Montserrat", cat:"Cecinas",    cal:100, prot:5,   carbs:1,   grasas:9,   fibra:0,   emoji:"🫙"},
  {id:35, nombre:"Marraqueta (unidad ~80g)",             marca:"Artesanal",  cat:"Panes",      cal:230, prot:7,   carbs:44,  grasas:2.5, fibra:2,   emoji:"🍞"},
  {id:36, nombre:"Hallulla (unidad ~70g)",               marca:"Artesanal",  cat:"Panes",      cal:200, prot:6,   carbs:38,  grasas:3,   fibra:1.5, emoji:"🫓"},
  {id:37, nombre:"Pan molde Harry's blanco (rebanada)",  marca:"Harry's",    cat:"Panes",      cal:70,  prot:2.5, carbs:13,  grasas:1,   fibra:0.5, emoji:"🍞"},
  {id:38, nombre:"Pan molde Harry's integral (rebanada)",marca:"Harry's",    cat:"Panes",      cal:65,  prot:3,   carbs:12,  grasas:0.8, fibra:2,   emoji:"🍞"},
  {id:39, nombre:"Pan Bimbo (rebanada)",                 marca:"Bimbo",      cat:"Panes",      cal:68,  prot:2.5, carbs:13.5,grasas:0.8, fibra:0.5, emoji:"🍞"},
  {id:40, nombre:"Pan pita Ideal (unidad)",              marca:"Ideal",      cat:"Panes",      cal:160, prot:5,   carbs:32,  grasas:1.5, fibra:1,   emoji:"🫓"},
  {id:41, nombre:"Sopaipilla (unidad)",                  marca:"Artesanal",  cat:"Panes",      cal:155, prot:3,   carbs:22,  grasas:6.5, fibra:1,   emoji:"🫓"},
  {id:42, nombre:"Avena Quaker (45g)",                   marca:"Quaker",     cat:"Cereales",   cal:170, prot:6,   carbs:30,  grasas:3,   fibra:4,   emoji:"🌾"},
  {id:43, nombre:"Musli Quaker (45g)",                   marca:"Quaker",     cat:"Cereales",   cal:175, prot:4.5, carbs:32,  grasas:3.5, fibra:3.5, emoji:"🥣"},
  {id:44, nombre:"Granola Quaker (45g)",                 marca:"Quaker",     cat:"Cereales",   cal:190, prot:4,   carbs:33,  grasas:5,   fibra:3,   emoji:"🥣"},
  {id:45, nombre:"Corn Flakes Nestlé (30g)",             marca:"Nestlé",     cat:"Cereales",   cal:110, prot:2.5, carbs:25,  grasas:0.2, fibra:0.8, emoji:"🥣"},
  {id:46, nombre:"Fitness Nestlé (30g)",                 marca:"Nestlé",     cat:"Cereales",   cal:110, prot:3,   carbs:23,  grasas:0.8, fibra:1.5, emoji:"🥣"},
  {id:47, nombre:"Milo Nestlé polvo (20g)",              marca:"Nestlé",     cat:"Cereales",   cal:80,  prot:3,   carbs:15,  grasas:1.2, fibra:0.5, emoji:"🍫"},
  {id:48, nombre:"Alfajor Costa (42g)",                  marca:"Costa",      cat:"Snacks",     cal:190, prot:2.5, carbs:28,  grasas:8,   fibra:0.5, emoji:"🍪"},
  {id:49, nombre:"Galletas Tritón Costa (30g)",          marca:"Costa",      cat:"Snacks",     cal:145, prot:1.5, carbs:21,  grasas:6,   fibra:0.5, emoji:"🍪"},
  {id:50, nombre:"Galletas Tostadas Costa (8g)",         marca:"Costa",      cat:"Snacks",     cal:35,  prot:1,   carbs:6,   grasas:0.8, fibra:0.3, emoji:"🍘"},
  {id:51, nombre:"Chocman Costa (42g)",                  marca:"Costa",      cat:"Snacks",     cal:180, prot:2,   carbs:26,  grasas:8,   fibra:0.5, emoji:"🍫"},
  {id:52, nombre:"Turrón de Viena Costa (30g)",          marca:"Costa",      cat:"Snacks",     cal:125, prot:1.5, carbs:20,  grasas:4.5, fibra:0.5, emoji:"🍫"},
  {id:53, nombre:"Oreo (34g / 3 galletas)",              marca:"Nabisco",    cat:"Snacks",     cal:160, prot:1.5, carbs:25,  grasas:7,   fibra:0.5, emoji:"🍪"},
  {id:54, nombre:"Papas fritas Lays (28g)",              marca:"Lays",       cat:"Snacks",     cal:150, prot:2,   carbs:15,  grasas:10,  fibra:1,   emoji:"🥔"},
  {id:55, nombre:"Pringles (28g)",                       marca:"Pringles",   cat:"Snacks",     cal:150, prot:2,   carbs:16,  grasas:9,   fibra:1,   emoji:"🥔"},
  {id:56, nombre:"Doritos (28g)",                        marca:"Doritos",    cat:"Snacks",     cal:140, prot:2,   carbs:18,  grasas:7,   fibra:1.5, emoji:"🌽"},
  {id:57, nombre:"Kuchen (porción 80g)",                 marca:"Artesanal",  cat:"Snacks",     cal:340, prot:5,   carbs:42,  grasas:17,  fibra:1,   emoji:"🥧"},
  {id:58, nombre:"Maní tostado (30g)",                   marca:"Genérico",   cat:"Snacks",     cal:175, prot:7,   carbs:6,   grasas:14,  fibra:2,   emoji:"🥜"},
  {id:59, nombre:"Almendras (30g)",                      marca:"Genérico",   cat:"Snacks",     cal:175, prot:6,   carbs:6,   grasas:15,  fibra:3.5, emoji:"🥜"},
  {id:60, nombre:"Coca-Cola (lata 350ml)",               marca:"Coca-Cola",  cat:"Bebidas",    cal:148, prot:0,   carbs:37,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:61, nombre:"Coca-Cola Zero (lata 350ml)",          marca:"Coca-Cola",  cat:"Bebidas",    cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0,   emoji:"🥤"},
  {id:62, nombre:"Fanta naranja (lata 350ml)",           marca:"Coca-Cola",  cat:"Bebidas",    cal:165, prot:0,   carbs:41,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:63, nombre:"Bilz (lata 350ml)",                    marca:"CCU",        cat:"Bebidas",    cal:140, prot:0,   carbs:35,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:64, nombre:"Pap (lata 350ml)",                     marca:"CCU",        cat:"Bebidas",    cal:130, prot:0,   carbs:33,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:65, nombre:"Cerveza Cristal (lata 350ml)",         marca:"CCU",        cat:"Bebidas",    cal:150, prot:1.5, carbs:14,  grasas:0,   fibra:0,   emoji:"🍺"},
  {id:66, nombre:"Cerveza Escudo (lata 350ml)",          marca:"CCU",        cat:"Bebidas",    cal:148, prot:1.5, carbs:13,  grasas:0,   fibra:0,   emoji:"🍺"},
  {id:67, nombre:"Jugo Watts naranja (200ml)",           marca:"Watts",      cat:"Bebidas",    cal:95,  prot:0.5, carbs:22,  grasas:0,   fibra:0,   emoji:"🧃"},
  {id:68, nombre:"Jugo Andina naranja (250ml)",          marca:"Andina",     cat:"Bebidas",    cal:110, prot:0.5, carbs:26,  grasas:0,   fibra:0,   emoji:"🧃"},
  {id:69, nombre:"Agua Cachantun (500ml)",               marca:"Cachantun",  cat:"Bebidas",    cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"💧"},
  {id:70, nombre:"Vino tinto (copa 150ml)",              marca:"Genérico",   cat:"Bebidas",    cal:125, prot:0,   carbs:4,   grasas:0,   fibra:0,   emoji:"🍷"},
  {id:71, nombre:"Café Nescafé negro (taza)",            marca:"Nestlé",     cat:"Bebidas",    cal:5,   prot:0.3, carbs:0.7, grasas:0,   fibra:0,   emoji:"☕"},
  {id:72, nombre:"Té en bolsita (taza)",                 marca:"Genérico",   cat:"Bebidas",    cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0,   emoji:"🍵"},
  {id:73, nombre:"Monster (473ml)",                      marca:"Monster",    cat:"Bebidas",    cal:220, prot:0,   carbs:55,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:74, nombre:"Palta (media ~80g)",                   marca:"Natural",    cat:"Frutas",     cal:130, prot:1.5, carbs:7,   grasas:12,  fibra:5,   emoji:"🥑"},
  {id:75, nombre:"Manzana (unidad ~150g)",               marca:"Natural",    cat:"Frutas",     cal:80,  prot:0.5, carbs:20,  grasas:0.3, fibra:3,   emoji:"🍎"},
  {id:76, nombre:"Plátano (unidad ~120g)",               marca:"Natural",    cat:"Frutas",     cal:105, prot:1.5, carbs:27,  grasas:0.3, fibra:3,   emoji:"🍌"},
  {id:77, nombre:"Naranja (unidad ~200g)",               marca:"Natural",    cat:"Frutas",     cal:90,  prot:2,   carbs:22,  grasas:0,   fibra:4,   emoji:"🍊"},
  {id:78, nombre:"Frutillas (taza ~150g)",               marca:"Natural",    cat:"Frutas",     cal:50,  prot:1,   carbs:12,  grasas:0.5, fibra:3,   emoji:"🍓"},
  {id:79, nombre:"Uva (racimo ~100g)",                   marca:"Natural",    cat:"Frutas",     cal:70,  prot:0.7, carbs:18,  grasas:0.2, fibra:1,   emoji:"🍇"},
  {id:80, nombre:"Durazno (unidad ~130g)",               marca:"Natural",    cat:"Frutas",     cal:50,  prot:1,   carbs:13,  grasas:0.3, fibra:2,   emoji:"🍑"},
  {id:81, nombre:"Chirimoya (100g)",                     marca:"Natural",    cat:"Frutas",     cal:75,  prot:1.5, carbs:18,  grasas:0.5, fibra:2.5, emoji:"🍈"},
  {id:82, nombre:"Lúcuma (100g)",                        marca:"Natural",    cat:"Frutas",     cal:99,  prot:1.5, carbs:23,  grasas:0.5, fibra:2,   emoji:"🍋"},
  {id:83, nombre:"Kiwi (unidad ~80g)",                   marca:"Natural",    cat:"Frutas",     cal:50,  prot:1,   carbs:12,  grasas:0.4, fibra:2.5, emoji:"🥝"},
  {id:84, nombre:"Tomate (unidad ~120g)",                marca:"Natural",    cat:"Verduras",   cal:25,  prot:1,   carbs:5,   grasas:0.3, fibra:1.5, emoji:"🍅"},
  {id:85, nombre:"Lechuga romana (taza ~50g)",           marca:"Natural",    cat:"Verduras",   cal:10,  prot:0.7, carbs:1.5, grasas:0.1, fibra:1,   emoji:"🥬"},
  {id:86, nombre:"Choclo (mazorca ~200g)",               marca:"Natural",    cat:"Verduras",   cal:130, prot:4,   carbs:28,  grasas:1.5, fibra:3,   emoji:"🌽"},
  {id:87, nombre:"Zanahoria (unidad ~80g)",              marca:"Natural",    cat:"Verduras",   cal:35,  prot:0.8, carbs:8,   grasas:0.2, fibra:2,   emoji:"🥕"},
  {id:88, nombre:"Cebolla (unidad ~110g)",               marca:"Natural",    cat:"Verduras",   cal:45,  prot:1.5, carbs:10,  grasas:0.1, fibra:2,   emoji:"🧅"},
  {id:89, nombre:"Papa (unidad ~150g)",                  marca:"Natural",    cat:"Verduras",   cal:120, prot:2.5, carbs:27,  grasas:0.2, fibra:2.5, emoji:"🥔"},
  {id:90, nombre:"Espinaca (taza ~30g)",                 marca:"Natural",    cat:"Verduras",   cal:7,   prot:1,   carbs:1,   grasas:0.1, fibra:0.7, emoji:"🥬"},
  {id:91, nombre:"Brócoli (taza ~90g)",                  marca:"Natural",    cat:"Verduras",   cal:30,  prot:2.5, carbs:6,   grasas:0.3, fibra:2.5, emoji:"🥦"},
  {id:92, nombre:"Pepino (100g)",                        marca:"Natural",    cat:"Verduras",   cal:16,  prot:0.7, carbs:3,   grasas:0.1, fibra:1,   emoji:"🥒"},
  {id:93, nombre:"Lentejas cocidas Gallo (100g)",        marca:"Gallo",      cat:"Legumbres",  cal:115, prot:9,   carbs:20,  grasas:0.4, fibra:8,   emoji:"🫘"},
  {id:94, nombre:"Porotos negros Gallo (100g)",          marca:"Gallo",      cat:"Legumbres",  cal:130, prot:9,   carbs:24,  grasas:0.5, fibra:7,   emoji:"🫘"},
  {id:95, nombre:"Garbanzos cocidos (100g)",             marca:"Gallo",      cat:"Legumbres",  cal:165, prot:9,   carbs:27,  grasas:2.5, fibra:8,   emoji:"🫘"},
  {id:96, nombre:"Porotos blancos Gallo (100g)",         marca:"Gallo",      cat:"Legumbres",  cal:125, prot:8.5, carbs:23,  grasas:0.4, fibra:7,   emoji:"🫘"},
  {id:97, nombre:"Arroz blanco cocido (100g)",           marca:"Genérico",   cat:"Granos",     cal:130, prot:2.7, carbs:28,  grasas:0.3, fibra:0.4, emoji:"🍚"},
  {id:98, nombre:"Arroz integral cocido (100g)",         marca:"Genérico",   cat:"Granos",     cal:110, prot:2.5, carbs:23,  grasas:0.8, fibra:1.8, emoji:"🍚"},
  {id:99, nombre:"Pasta Carozzi cocida (100g)",          marca:"Carozzi",    cat:"Granos",     cal:160, prot:5.5, carbs:32,  grasas:0.9, fibra:2,   emoji:"🍝"},
  {id:100,nombre:"Pasta integral Carozzi (100g)",        marca:"Carozzi",    cat:"Granos",     cal:150, prot:6,   carbs:30,  grasas:1,   fibra:4,   emoji:"🍝"},
  {id:101,nombre:"Quinoa cocida (100g)",                 marca:"Genérico",   cat:"Granos",     cal:120, prot:4.5, carbs:21,  grasas:2,   fibra:2.8, emoji:"🌾"},
  {id:102,nombre:"Reineta al horno (100g)",              marca:"Natural",    cat:"Pescados",   cal:115, prot:20,  carbs:0,   grasas:3.5, fibra:0,   emoji:"🐟"},
  {id:103,nombre:"Salmón (100g)",                        marca:"Natural",    cat:"Pescados",   cal:200, prot:20,  carbs:0,   grasas:13,  fibra:0,   emoji:"🐟"},
  {id:104,nombre:"Merluza (100g)",                       marca:"Natural",    cat:"Pescados",   cal:80,  prot:18,  carbs:0,   grasas:0.8, fibra:0,   emoji:"🐟"},
  {id:105,nombre:"Atún Salmonte en agua (100g)",         marca:"Salmonte",   cat:"Pescados",   cal:100, prot:23,  carbs:0,   grasas:1,   fibra:0,   emoji:"🥫"},
  {id:106,nombre:"Sardinas en aceite (85g)",             marca:"Genérico",   cat:"Pescados",   cal:190, prot:23,  carbs:0,   grasas:11,  fibra:0,   emoji:"🥫"},
  {id:107,nombre:"Machas al natural (100g)",             marca:"Natural",    cat:"Pescados",   cal:55,  prot:10,  carbs:3,   grasas:0.5, fibra:0,   emoji:"🦪"},
  {id:108,nombre:"Huevo entero (unidad L ~60g)",         marca:"Natural",    cat:"Huevos",     cal:70,  prot:6,   carbs:0.5, grasas:5,   fibra:0,   emoji:"🥚"},
  {id:109,nombre:"Clara de huevo (unidad)",              marca:"Natural",    cat:"Huevos",     cal:17,  prot:3.5, carbs:0.2, grasas:0,   fibra:0,   emoji:"🥚"},
  {id:110,nombre:"Huevo duro (unidad)",                  marca:"Natural",    cat:"Huevos",     cal:68,  prot:6,   carbs:0.6, grasas:4.8, fibra:0,   emoji:"🍳"},
  {id:111,nombre:"Aceite de oliva Chef (15ml)",          marca:"Chef",       cat:"Aceites",    cal:135, prot:0,   carbs:0,   grasas:15,  fibra:0,   emoji:"🫙"},
  {id:112,nombre:"Aceite vegetal Mazola (15ml)",         marca:"Mazola",     cat:"Aceites",    cal:125, prot:0,   carbs:0,   grasas:14,  fibra:0,   emoji:"🫙"},
  {id:113,nombre:"Empanada de pino (unidad)",            marca:"Artesanal",  cat:"Comidas CL", cal:360, prot:14,  carbs:38,  grasas:16,  fibra:2,   emoji:"🥟"},
  {id:114,nombre:"Empanada de queso (unidad)",           marca:"Artesanal",  cat:"Comidas CL", cal:310, prot:12,  carbs:35,  grasas:14,  fibra:1,   emoji:"🥟"},
  {id:115,nombre:"Empanada de mariscos (unidad)",        marca:"Artesanal",  cat:"Comidas CL", cal:280, prot:14,  carbs:33,  grasas:11,  fibra:1,   emoji:"🥟"},
  {id:116,nombre:"Cazuela de vacuno (plato)",            marca:"Artesanal",  cat:"Comidas CL", cal:265, prot:22,  carbs:28,  grasas:7,   fibra:3,   emoji:"🍲"},
  {id:117,nombre:"Pastel de choclo (porción)",           marca:"Artesanal",  cat:"Comidas CL", cal:360, prot:15,  carbs:45,  grasas:14,  fibra:3,   emoji:"🫕"},
  {id:118,nombre:"Completo italiano",                    marca:"Artesanal",  cat:"Comidas CL", cal:480, prot:15,  carbs:45,  grasas:26,  fibra:3,   emoji:"🌭"},
  {id:119,nombre:"Chorrillana (porción)",                marca:"Artesanal",  cat:"Comidas CL", cal:820, prot:30,  carbs:75,  grasas:44,  fibra:5,   emoji:"🍟"},
  {id:120,nombre:"Sopaipilla pasada (unidad)",           marca:"Artesanal",  cat:"Comidas CL", cal:180, prot:3,   carbs:32,  grasas:5,   fibra:1,   emoji:"🫓"},
  {id:121,nombre:"Mote con huesillos (vaso)",            marca:"Artesanal",  cat:"Comidas CL", cal:290, prot:4,   carbs:66,  grasas:0.5, fibra:3,   emoji:"🥤"},
  {id:122,nombre:"Humita (unidad)",                      marca:"Artesanal",  cat:"Comidas CL", cal:210, prot:5,   carbs:38,  grasas:5,   fibra:3,   emoji:"🌽"},
  {id:123,nombre:"Charquicán (plato)",                   marca:"Artesanal",  cat:"Comidas CL", cal:290, prot:20,  carbs:38,  grasas:7,   fibra:5,   emoji:"🥘"},
  {id:124,nombre:"Porotos con riendas (plato)",          marca:"Artesanal",  cat:"Comidas CL", cal:320, prot:14,  carbs:55,  grasas:5,   fibra:12,  emoji:"🫘"},
  {id:125,nombre:"Azúcar Iansa (5g)",                    marca:"Iansa",      cat:"Condimentos",cal:20,  prot:0,   carbs:5,   grasas:0,   fibra:0,   emoji:"🍬"},
  {id:126,nombre:"Miel de abeja (7g)",                   marca:"Natural",    cat:"Condimentos",cal:22,  prot:0,   carbs:6,   grasas:0,   fibra:0,   emoji:"🍯"},
  {id:127,nombre:"Mayonesa Hellmann's (15g)",            marca:"Hellmann's", cat:"Condimentos",cal:100, prot:0.1, carbs:0.5, grasas:11,  fibra:0,   emoji:"🫙"},
  {id:128,nombre:"Ketchup Malloa (15g)",                 marca:"Malloa",     cat:"Condimentos",cal:20,  prot:0.3, carbs:5,   grasas:0,   fibra:0.3, emoji:"🍅"},
  {id:129,nombre:"Mermelada Watts (20g)",                marca:"Watts",      cat:"Condimentos",cal:45,  prot:0.1, carbs:11,  grasas:0,   fibra:0.3, emoji:"🍓"},
  {id:130,nombre:"Salsa tomate Malloa (50g)",            marca:"Malloa",     cat:"Condimentos",cal:30,  prot:1,   carbs:7,   grasas:0,   fibra:1,   emoji:"🫙"},
  {id:131,nombre:"Whey protein (medida 30g)",            marca:"Genérico",   cat:"Suplementos",cal:120, prot:24,  carbs:3,   grasas:2,   fibra:0,   emoji:"💪"},
  {id:132,nombre:"Proteína vegana (medida 30g)",         marca:"Genérico",   cat:"Suplementos",cal:110, prot:20,  carbs:5,   grasas:2.5, fibra:1,   emoji:"🌱"},
  {id:133,nombre:"Barra proteica (50g)",                 marca:"Genérico",   cat:"Suplementos",cal:200, prot:20,  carbs:22,  grasas:5,   fibra:3,   emoji:"🍫"},
  {id:134,nombre:"Creatina monohidratada (5g)",          marca:"Genérico",   cat:"Suplementos",cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"⚗️"},
];

/* ═══════════════════════════════════════════
   DIETAS
═══════════════════════════════════════════ */
const DIETAS = [
  {id:"perf",icon:"🔥",nombre:"Pérdida de Grasa",color:"#C94B35",
   desc:"Déficit moderado, alta proteína. Pierdes grasa sin perder músculo.",
   cals:"TDEE − 500 kcal",macros:"35% prot / 30% carbs / 35% grasas",
   reglas:["Déficit de ~500 kcal diarias","Proteína 1.8–2.2g por kg de peso","Come proteínas en cada comida","Carbohidratos mayormente post-entreno","Sin bebidas azucaradas ni snacks procesados"],
   menu:[{t:"Desayuno 🌅",d:"Avena Quaker + Leche descremada + Frutillas"},{t:"Snack AM 🍎",d:"Yogurt Soprole 0% + 10 almendras"},{t:"Almuerzo 🍽️",d:"Pechuga pollo (200g) + Arroz integral + Brócoli"},{t:"Once ☕",d:"2 tostadas Harry's integral + Jamón pavo + Té"},{t:"Cena 🌙",d:"Merluza al horno (200g) + Espinaca + Tomate"}]},
  {id:"mant",icon:"⚖️",nombre:"Mantenimiento",color:"#4A86C8",
   desc:"Come igual a lo que gastas. Dieta balanceada y variada.",
   cals:"= TDEE",macros:"25% prot / 45% carbs / 30% grasas",
   reglas:["Calorías = tu TDEE exacto","Balance entre los 3 macros","Incluye todos los grupos de alimentos","Prioriza alimentos integrales","2–3 litros de agua al día"],
   menu:[{t:"Desayuno 🌅",d:"2 tostadas + 2 huevos revueltos + Café con leche"},{t:"Snack AM 🍊",d:"Fruta de temporada + Yogurt Colun"},{t:"Almuerzo 🍽️",d:"Cazuela de vacuno o Pollo + arroz + ensalada"},{t:"Once ☕",d:"Marraqueta + Queso chanco + Té con leche"},{t:"Cena 🌙",d:"Pasta Carozzi + Atún Salmonte + Ensalada tomate"}]},
  {id:"recomp",icon:"💪",nombre:"Recomposición Corporal",color:"#7C5CBF",
   desc:"Come al TDEE con altísima proteína. Pierdes grasa y ganas músculo.",
   cals:"= TDEE",macros:"40% prot / 35% carbs / 25% grasas",
   reglas:["Calorías = TDEE","Proteína muy alta: 2.2–2.5g/kg","Carbohidratos alrededor del entrenamiento","Grasas saludables: palta, aceite oliva, nueces","Entrenamiento de fuerza 3–5 veces/semana obligatorio"],
   menu:[{t:"Desayuno 🌅",d:"4 claras + 2 huevos + Avena (30g) + Frutillas"},{t:"Pre-entreno 💪",d:"Plátano + Whey protein (30g)"},{t:"Almuerzo 🍽️",d:"Pechuga (250g) + Arroz integral (150g) + Palta"},{t:"Once ☕",d:"Yogurt griego Danone + Almendras + Manzana"},{t:"Cena 🌙",d:"Salmón (200g) + Quinoa + Espinaca + Brócoli"}]},
  {id:"volum",icon:"📈",nombre:"Ganancia de Masa Muscular",color:"#3A9E6A",
   desc:"Superávit moderado para construir músculo limpio y fuerte.",
   cals:"TDEE + 300 kcal",macros:"25% prot / 50% carbs / 25% grasas",
   reglas:["Superávit de +250–350 kcal","Alta proteína y carbohidratos","Come cada 3–4 horas","Desayuno abundante y con carbohidratos","Post-entreno: proteína + carbohidratos rápidos"],
   menu:[{t:"Desayuno 🌅",d:"Avena (80g) + Leche entera + 2 huevos + Plátano + Milo"},{t:"Snack AM 🥜",d:"Marraqueta + Mantequilla + Manjar Colun"},{t:"Almuerzo 🍽️",d:"Lomo vacuno (200g) + Arroz blanco (200g) + Choclo"},{t:"Post-entreno 💪",d:"Whey protein + Plátano + Granola Quaker"},{t:"Cena 🌙",d:"Pollo (200g) + Pasta Carozzi (150g) + Salsa tomate"}]},
  {id:"lowcarb",icon:"🥑",nombre:"Low Carb Chilena",color:"#C07C24",
   desc:"Baja en carbohidratos, rica en grasas saludables.",
   cals:"= TDEE",macros:"30% prot / 15% carbs / 55% grasas",
   reglas:["Máximo 80–100g de carbohidratos/día","Sin pan, arroz, pasta ni azúcar","Base: palta, queso, huevo, carnes","Solo frutas bajas en azúcar: frutillas, kiwi","Aceite de oliva y frutos secos como fuente de grasa"],
   menu:[{t:"Desayuno 🌅",d:"3 huevos con queso gauda + Palta + Café negro"},{t:"Snack AM 🧀",d:"Queso gauda Colun (60g) + Almendras (30g)"},{t:"Almuerzo 🍽️",d:"Salmón al horno (200g) + Espinaca + Palta + Aceite oliva"},{t:"Once ☕",d:"Galletas Tostadas (2) + Queso crema + Jamón serrano + Té"},{t:"Cena 🌙",d:"Filete de vacuno (200g) + Ensalada hojas verdes + Aceite oliva"}]},
];

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const CATS = ["Todas","Lácteos","Carnes","Cecinas","Panes","Cereales","Snacks","Bebidas","Frutas","Verduras","Legumbres","Granos","Pescados","Huevos","Comidas CL","Aceites","Condimentos","Suplementos"];
const MEALS = ["Desayuno","Almuerzo","Once","Cena","Snack"];
const MC  = {Desayuno:"#E07B4A",Almuerzo:"#C94B35",Once:"#8B5AA8",Cena:"#285C3E",Snack:"#5BA87A"};
const MI  = {Desayuno:"🌅",Almuerzo:"☀️",Once:"☕",Cena:"🌙",Snack:"🍎"};
const MACROS = [
  {k:"prot",  lS:"Prot",  lL:"Proteínas",    c:"#C94B35", bg:"#FBE9E6"},
  {k:"carbs", lS:"Carbs", lL:"Carbohidratos",c:"#C07C24", bg:"#FEF4E6"},
  {k:"grasas",lS:"Grasas",lL:"Grasas",       c:"#9B4F72", bg:"#F9EAF2"},
  {k:"fibra", lS:"Fibra", lL:"Fibra",         c:"#3D8A59", bg:"#E7F5EE"},
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const calcTDEE = ({peso,altura,edad,sexo,act}) => {
  const bmr = sexo==="M"?10*peso+6.25*altura-5*edad+5:10*peso+6.25*altura-5*edad-161;
  return Math.round(bmr*parseFloat(act));
};
const calcMetas = (tdee, obj) => {
  const O={bajar:{d:-500,p:.35,c:.30,g:.35},mantener:{d:0,p:.25,c:.45,g:.30},recomp:{d:0,p:.40,c:.35,g:.25},subir:{d:300,p:.25,c:.50,g:.25}};
  const {d,p,c,g}=O[obj]||O.mantener;
  const cal=Math.max(1200,tdee+d);
  return {cal,prot:Math.round(cal*p/4),carbs:Math.round(cal*c/4),grasas:Math.round(cal*g/9)};
};
const sumLog = (log) => log.reduce((a,i)=>({cal:a.cal+i.cal*i.qty,prot:a.prot+i.prot*i.qty,carbs:a.carbs+i.carbs*i.qty,grasas:a.grasas+i.grasas*i.qty,fibra:a.fibra+i.fibra*i.qty}),{cal:0,prot:0,carbs:0,grasas:0,fibra:0});


/* ═══════════════════════════════════════════
   DESIGN SYSTEM — LIGHT & DARK
═══════════════════════════════════════════ */
const LIGHT = {
  primary:"#285C3E", primaryDark:"#1B3F2A", primaryMid:"#3D7A55", primaryGlow:"#6ECC8A",
  accent:"#E07B4A",  accentDark:"#C05D30",
  bg:"#F2EAE0",      surface:"#FFFFFF",      surfaceAlt:"#FAF6F1", border:"#EBE3D9",
  text:"#1A2820",    textSec:"#6E8072",       textMuted:"#B0BDB4",
  navBg:"rgba(255,255,255,0.96)", headerBg:"#285C3E",
  ringTrack:"rgba(255,255,255,0.09)", ringStroke:"#6ECC8A",
};
const DARK = {
  primary:"#4EA870",  primaryDark:"#2A5C3E",  primaryMid:"#5AB87E", primaryGlow:"#6ECC8A",
  accent:"#E07B4A",   accentDark:"#C05D30",
  bg:"#0C1610",       surface:"#14201A",       surfaceAlt:"#1C2C22", border:"#26382E",
  text:"#DCF0E2",     textSec:"#7A9882",        textMuted:"#3A5040",
  navBg:"rgba(12,22,16,0.97)", headerBg:"#0C1610",
  ringTrack:"rgba(255,255,255,0.07)", ringStroke:"#6ECC8A",
};
const F = "'Sora','Nunito',-apple-system,sans-serif";

/* ═══════════════════════════════════════════
   LOGO COMPONENT
═══════════════════════════════════════════ */
function NutriLogo({size=36}) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="130" height="130" rx="30" fill="white" stroke="#DDD4C8" strokeWidth="2"/>
      <ellipse cx="65" cy="94" rx="33" ry="6" fill="#EDE0D0"/>
      <circle cx="65" cy="78" r="32" fill="#F9F4EF" stroke="#DDD4C8" strokeWidth="2"/>
      <circle cx="65" cy="78" r="24" fill="white" stroke="#EBE3D9" strokeWidth="1.5"/>
      <ellipse cx="57" cy="83" rx="9" ry="5" fill="#F5EDD8"/>
      <circle cx="52" cy="82" r="2" fill="#EDE0C0"/>
      <circle cx="55" cy="85" r="2" fill="#F0E8CE"/>
      <circle cx="58" cy="83" r="2" fill="#EDE0C0"/>
      <circle cx="61" cy="85" r="2" fill="#F0E8CE"/>
      <circle cx="54" cy="80" r="1.8" fill="#F5EDD8"/>
      <circle cx="57" cy="87" r="1.8" fill="#EDE0C0"/>
      <circle cx="60" cy="81" r="1.8" fill="#F5EDD8"/>
      <circle cx="63" cy="84" r="1.8" fill="#EDE0C0"/>
      <ellipse cx="57" cy="72" rx="12" ry="9.5" fill="#C8845A"/>
      <ellipse cx="57" cy="72" rx="8.5" ry="6.5" fill="#DFA878"/>
      <ellipse cx="57" cy="72" rx="4.5" ry="3" fill="#C8845A"/>
      <line x1="57" y1="63" x2="57" y2="58" stroke="#D0D0D0" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="57" cy="57" rx="4" ry="2.5" fill="#E8E8E8"/>
      <line x1="76" y1="86" x2="76" y2="79" stroke="#1E5C34" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="76" cy="75" r="6.5" fill="#2E7A48"/>
      <circle cx="70" cy="78" r="5" fill="#2E7A48"/>
      <circle cx="82" cy="78" r="5" fill="#2E7A48"/>
      <circle cx="76" cy="70" r="3.5" fill="#4EA870"/>
      <circle cx="70" cy="76" r="2.5" fill="#4EA870"/>
      <circle cx="82" cy="76" r="2.5" fill="#4EA870"/>
      <ellipse cx="65" cy="87" rx="6.5" ry="3.5" fill="#E07B4A" transform="rotate(-20 65 87)"/>
      <ellipse cx="65" cy="87" rx="5" ry="2.5" fill="#EA9060" transform="rotate(-20 65 87)"/>
      <path d="M61 82 Q62.5 79 64 80.5" stroke="#3D8A59" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="27" y1="52" x2="27" y2="92" stroke="#285C3E" strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="52" x2="22" y2="64" stroke="#285C3E" strokeWidth="2" strokeLinecap="round"/>
      <line x1="27" y1="52" x2="27" y2="64" stroke="#285C3E" strokeWidth="2" strokeLinecap="round"/>
      <line x1="32" y1="52" x2="32" y2="64" stroke="#285C3E" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 64 Q27 68 32 64" fill="none" stroke="#285C3E" strokeWidth="2"/>
      <line x1="103" y1="52" x2="103" y2="92" stroke="#285C3E" strokeWidth="3" strokeLinecap="round"/>
      <path d="M103 52 Q111 60 103 68" fill="#285C3E"/>
      <text x="65" y="28" textAnchor="middle" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fill="#285C3E">Calorú</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════ */
export default function App() {
  const [tab,setTab]         = useState(0);
  const [log,setLog]         = useState([]);
  const [meal,setMeal]       = useState("Desayuno");
  const [q,setQ]             = useState("");
  const [cat,setCat]         = useState("Todas");
  const [perfil,setPerfil]   = useState({peso:70,altura:170,edad:25,sexo:"M",act:"1.55"});
  const [obj,setObj]         = useState("mantener");
  const [expanded,setExpand] = useState(null);
  const [agua,setAgua]       = useState(0);
  const [dark,setDark]       = useState(false);

  const C = dark ? DARK : LIGHT;

  /* inject font + base styles */
  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap";
    link.rel="stylesheet"; document.head.appendChild(link);
    const s=document.createElement("style");
    s.textContent=`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{display:none;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.tab-anim{animation:fadeUp .25s ease}.food-card:active{transform:scale(.97)}.tap:active{opacity:.75;transform:scale(.95)}`;
    document.head.appendChild(s);
  },[]);

  /* sync body background */
  useEffect(()=>{ document.body.style.background=C.bg; },[dark]);

  /* computed */
  const tdee  = calcTDEE(perfil);
  const metas = calcMetas(tdee, obj);
  const tot   = useMemo(()=>sumLog(log),[log]);
  const pct   = metas.cal>0?tot.cal/metas.cal:0;
  const reste = Math.max(0,metas.cal-Math.round(tot.cal));
  const sobre = Math.round(tot.cal)-metas.cal;
  const barColor=tot.cal>metas.cal?"#C94B35":pct>.85?"#C07C24":"#3D8A59";

  const foods = useMemo(()=>DB.filter(a=>{
    const s=q.toLowerCase();
    return (a.nombre.toLowerCase().includes(s)||a.marca.toLowerCase().includes(s))&&(cat==="Todas"||a.cat===cat);
  }),[q,cat]);

  /* achievements */
  const loggedAll = MEALS.every(m=>log.some(r=>r.comida===m));
  const achievements = useMemo(()=>{
    const list=[];
    if(log.length>0)               list.push({icon:"🌱",label:"Primer registro",  c:"#3D8A59"});
    if(agua>=8)                    list.push({icon:"💧",label:"Hidratado",        c:"#3A8FC8"});
    if(pct>=0.5 && pct<=1.1)       list.push({icon:"🎯",label:"En tu meta",       c:"#C07C24"});
    if(loggedAll)                  list.push({icon:"✅",label:"Día completo",     c:"#7C5CBF"});
    if(pct>1.1)                    list.push({icon:"⚠️",label:"Excediste meta",   c:"#C94B35"});
    return list;
  },[log,agua,pct,loggedAll]);

  const streakActive = log.length>0;

  /* actions */
  const add=(a)=>{
    const ex=log.find(r=>r.id===a.id&&r.comida===meal);
    if(ex) setLog(log.map(r=>r.id===a.id&&r.comida===meal?{...r,qty:r.qty+1}:r));
    else   setLog([...log,{...a,comida:meal,qty:1,uid:Date.now()+Math.random()}]);
  };
  const adj=(uid,d)=>setLog(log.map(r=>r.uid===uid?{...r,qty:r.qty+d}:r).filter(r=>r.qty>0));

  const hr=new Date().getHours();
  const SALUDO=hr<12?"Buenos días":hr<19?"Buenas tardes":"Buenas noches";
  const ringR=54, ringC=2*Math.PI*ringR, ringPct=Math.min(pct,1);

  const motivacion=(p)=>{
    if(p===0) return "¿Qué comerás hoy?";
    if(p<.3)  return "¡Buen comienzo!";
    if(p<.6)  return "¡Vas a mitad de camino! 🌿";
    if(p<.9)  return "¡Casi en tu meta! 🎯";
    if(p<=1)  return "¡Último empujón! 🔥";
    return "¡Meta cumplida! 🏆";
  };

  /* Inline stepper (needs access to C) */
  const Stepper=({value,onDec,onInc})=>(
    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      <button onClick={onDec} style={{width:30,height:30,borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:17,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
      <span style={{fontSize:14,fontWeight:800,color:C.text,minWidth:20,textAlign:"center"}}>{value}</span>
      <button onClick={onInc} style={{width:30,height:30,borderRadius:9,border:"none",background:C.primary,color:"white",fontSize:17,cursor:"pointer",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    </div>
  );

  /* ─────────────── RENDER ─────────────── */
  return (
    <div style={{fontFamily:F,minHeight:"100vh",background:C.bg,paddingBottom:88,transition:"background .3s ease"}}>

      {/* ══ HEADER ══ */}
      <div style={{background:C.headerBg,padding:"14px 18px 12px",position:"sticky",top:0,zIndex:20,boxShadow:"0 2px 18px rgba(0,0,0,0.25)",transition:"background .3s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <NutriLogo size={42}/>
            <div>
              <div style={{color:"#fff",fontSize:17,fontWeight:800,letterSpacing:"-.5px",lineHeight:1}}>Calorú</div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:500,marginTop:1}}>
                {new Date().toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"short"})}
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#fff",fontSize:14,fontWeight:800,lineHeight:1}}>{Math.round(tot.cal)}<span style={{fontSize:11,fontWeight:500,opacity:.55}}> / {metas.cal}</span></div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:500,marginTop:1}}>{tot.cal>metas.cal?`+${sobre} extra`:` ${reste} libres`}</div>
            </div>
            {/* Dark mode toggle */}
            <button className="tap" onClick={()=>setDark(!dark)} style={{
              width:36,height:36,borderRadius:12,border:"none",
              background:"rgba(255,255,255,0.12)",color:"white",
              fontSize:17,cursor:"pointer",fontFamily:F,
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0,
            }}>{dark?"☀️":"🌙"}</button>
          </div>
        </div>
        <div style={{height:5,background:"rgba(255,255,255,0.1)",borderRadius:10,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(pct*100,100)}%`,background:`linear-gradient(90deg,${C.primaryGlow},${barColor})`,borderRadius:10,transition:"width .7s ease"}}/>
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>

        {/* ══════════ TAB 0: INICIO ══════════ */}
        {tab===0&&<div className="tab-anim">

          {/* Greeting */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:21,fontWeight:800,color:C.text,letterSpacing:"-.5px"}}>{SALUDO} 👋</div>
            <div style={{fontSize:13,color:C.textSec,fontWeight:500,marginTop:3}}>{motivacion(pct)}</div>
          </div>

          {/* ── STREAK + ACHIEVEMENTS ROW ── */}
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14,scrollbarWidth:"none"}}>
            {/* Streak pill */}
            <div style={{
              flexShrink:0,
              background:streakActive?"linear-gradient(135deg,#C94B35,#E06030)":"linear-gradient(135deg,#3A3A3A,#555)",
              borderRadius:16,padding:"8px 14px",
              display:"flex",alignItems:"center",gap:7,
              boxShadow:streakActive?"0 4px 14px rgba(201,75,53,0.4)":"none",
              opacity:streakActive?1:0.5,
            }}>
              <span style={{fontSize:20}}>🔥</span>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:"white",lineHeight:1}}>Racha activa</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:500,marginTop:1}}>
                  {streakActive?"¡Sigue así!":"Registra algo"}
                </div>
              </div>
            </div>

            {/* Daily goal progress pill */}
            <div style={{
              flexShrink:0,
              background:dark?"#1C2C22":"#fff",
              borderRadius:16,padding:"8px 14px",
              display:"flex",alignItems:"center",gap:8,
              border:`1.5px solid ${C.border}`,
              boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                width:32,height:32,borderRadius:10,
                background:"linear-gradient(135deg,#285C3E,#3D7A55)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,
              }}>🎯</div>
              <div>
                <div style={{fontSize:11,fontWeight:800,color:C.text,lineHeight:1}}>{Math.round(pct*100)}% de meta</div>
                <div style={{fontSize:9,color:C.textSec,fontWeight:500,marginTop:1}}>{metas.cal} kcal / día</div>
              </div>
            </div>

            {/* Achievement chips */}
            {achievements.map(({icon,label,c})=>(
              <div key={label} style={{
                flexShrink:0,
                background:`${c}22`,
                border:`1.5px solid ${c}55`,
                borderRadius:16,padding:"8px 14px",
                display:"flex",alignItems:"center",gap:6,
              }}>
                <span style={{fontSize:16}}>{icon}</span>
                <div style={{fontSize:11,fontWeight:700,color:c,whiteSpace:"nowrap"}}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── CALORIE HERO ── */}
          <div style={{
            background:`linear-gradient(145deg,${C.primary},${C.primaryDark})`,
            borderRadius:26,padding:"20px 18px",marginBottom:12,
            boxShadow:"0 10px 32px rgba(0,0,0,0.22)",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",right:-20,top:-20,width:120,height:120,background:"rgba(255,255,255,0.04)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{position:"absolute",left:-30,bottom:-30,width:100,height:100,background:"rgba(255,255,255,0.03)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:16,position:"relative"}}>
              <div style={{flexShrink:0,position:"relative",width:130,height:130}}>
                <svg width={130} height={130} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={ringR} fill="none" stroke={C.ringTrack} strokeWidth={10}/>
                  <circle cx={60} cy={60} r={ringR} fill="none"
                    stroke={tot.cal>metas.cal?"#F28B76":C.ringStroke} strokeWidth={10}
                    strokeDasharray={`${ringPct*ringC} ${ringC}`} strokeLinecap="round"
                    transform="rotate(-90 60 60)" style={{transition:"stroke-dasharray .8s ease"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",fontWeight:600,textTransform:"uppercase",letterSpacing:.8}}>{tot.cal>metas.cal?"Pasaste":"Libres"}</div>
                  <div style={{fontSize:27,fontWeight:800,color:"#fff",lineHeight:1.1,marginTop:2}}>{tot.cal>metas.cal?sobre:reste}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",fontWeight:500}}>kcal</div>
                </div>
              </div>
              <div style={{flex:1}}>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Consumidas</div>
                  <div style={{fontSize:30,fontWeight:800,color:"#fff",lineHeight:1}}>{Math.round(tot.cal)}<span style={{fontSize:13,fontWeight:400,opacity:.45}}> kcal</span></div>
                </div>
                {[{l:"Proteínas",v:tot.prot,m:metas.prot,c:"#FF9B8A"},{l:"Carbohidratos",v:tot.carbs,m:metas.carbs,c:"#FFD08A"},{l:"Grasas",v:tot.grasas,m:metas.grasas,c:"#FFA8CE"}].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:5}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.45)",fontWeight:600}}>{l}</span>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.7)",fontWeight:700}}>{Math.round(v)}/{m}g</span>
                    </div>
                    <div style={{height:4,background:"rgba(255,255,255,0.09)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:4,transition:"width .5s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 4 MACRO CARDS ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
            {[
              {k:"prot",  lS:"Prot",  g:["#C94B35","#E06555"], sh:"#C94B3560"},
              {k:"carbs", lS:"Carbs", g:["#C07C24","#D99240"], sh:"#C07C2460"},
              {k:"grasas",lS:"Grasas",g:["#9B4F72","#B5668A"], sh:"#9B4F7260"},
              {k:"fibra", lS:"Fibra", g:["#3D8A59","#52A872"], sh:"#3D8A5960"},
            ].map(({k,lS,g,sh})=>{
              const v=tot[k], m=k==="fibra"?25:metas[k], p2=m>0?Math.min(v/m*100,100):0;
              const r=20, circ=2*Math.PI*r;
              return (
                <div key={k} style={{
                  background:`linear-gradient(145deg,${g[0]},${g[1]})`,
                  borderRadius:20,padding:"12px 6px 10px",
                  boxShadow:`0 6px 18px ${sh}`,
                  textAlign:"center",position:"relative",overflow:"hidden",
                }}>
                  <div style={{position:"absolute",top:-14,right:-14,width:50,height:50,background:"rgba(255,255,255,0.08)",borderRadius:"50%",pointerEvents:"none"}}/>
                  <div style={{position:"relative",width:48,height:48,margin:"0 auto 6px"}}>
                    <svg width={48} height={48} viewBox="0 0 46 46">
                      <circle cx={23} cy={23} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={5}/>
                      <circle cx={23} cy={23} r={r} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={5}
                        strokeDasharray={`${p2/100*circ} ${circ}`} strokeLinecap="round"
                        transform="rotate(-90 23 23)" style={{transition:"stroke-dasharray .7s ease"}}/>
                    </svg>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"white",lineHeight:1}}>{Math.round(v)}</div>
                    </div>
                  </div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.85)",fontWeight:800,textTransform:"uppercase",letterSpacing:.6}}>{lS}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.45)",fontWeight:500,marginTop:1}}>/{m}g</div>
                </div>
              );
            })}
          </div>

          {/* ── WATER TRACKER ── */}
          <div style={{
            background:"linear-gradient(145deg,#2878A8,#3A9ED4)",
            borderRadius:22,padding:"14px 16px",marginBottom:12,
            boxShadow:"0 6px 20px rgba(40,120,168,0.38)",
            position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",right:-18,top:-18,width:90,height:90,background:"rgba(255,255,255,0.06)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,position:"relative"}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:"white"}}>Hidratación</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:500,marginTop:1}}>{agua===8?"¡Meta cumplida! 🎉":`${agua} de 8 vasos`}</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:22,lineHeight:1}}>💧</span>
                <span style={{fontSize:20,fontWeight:800,color:"white"}}>{agua}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:500}}>/8</span>
              </div>
            </div>
            <div style={{display:"flex",gap:5,position:"relative"}}>
              {Array.from({length:8}).map((_,i)=>(
                <button key={i} className="tap" onClick={()=>setAgua(i<agua?i:i+1)} style={{
                  flex:1,height:44,borderRadius:12,border:"none",cursor:"pointer",
                  background:i<agua?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.08)",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  gap:2,transition:"all .2s ease",padding:0,fontFamily:F,
                }}>
                  <span style={{fontSize:16,opacity:i<agua?1:0.25,transition:"opacity .2s"}}>{i<agua?"💧":"○"}</span>
                  <span style={{fontSize:7,fontWeight:700,color:i<agua?"white":"rgba(255,255,255,0.3)"}}>{i+1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── COMIDAS ── */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>Comidas de hoy</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {MEALS.map(m=>{
                const items=log.filter(r=>r.comida===m);
                const cal=items.reduce((s,r)=>s+r.cal*r.qty,0);
                const p2=metas.cal>0?Math.min(cal/metas.cal*100,100):0;
                const hasFood=items.length>0;
                return (
                  <div key={m} style={{
                    borderRadius:20,overflow:"hidden",
                    boxShadow:hasFood?`0 6px 20px ${MC[m]}30`:`0 2px 10px rgba(0,0,0,${dark?.1:.06})`,
                    border:`1.5px solid ${hasFood?MC[m]+"55":C.border}`,
                    transition:"all .3s ease",
                  }}>
                    {/* Colored header strip */}
                    <div style={{
                      background:hasFood
                        ?`linear-gradient(135deg,${MC[m]},${MC[m]}CC)`
                        :`linear-gradient(135deg,${MC[m]}28,${MC[m]}10)`,
                      padding:"10px 14px",
                      display:"flex",alignItems:"center",gap:12,
                      transition:"background .3s",
                    }}>
                      <div style={{
                        width:42,height:42,borderRadius:13,flexShrink:0,
                        background:hasFood?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.08)",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                      }}>{MI[m]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:800,color:hasFood?"white":C.text,lineHeight:1}}>{m}</div>
                        {hasFood
                          ?<div style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:500,marginTop:2}}>{items.length} alimento{items.length>1?"s":""}</div>
                          :<div style={{fontSize:11,color:hasFood?"rgba(255,255,255,0.75)":C.textMuted,fontWeight:500,marginTop:2}}>Vacío</div>
                        }
                      </div>
                      {hasFood
                        ?<div style={{background:"rgba(255,255,255,0.22)",borderRadius:12,padding:"5px 10px"}}>
                          <div style={{fontSize:14,fontWeight:800,color:"white",lineHeight:1}}>{Math.round(cal)}</div>
                          <div style={{fontSize:8,color:"rgba(255,255,255,0.7)",textAlign:"center"}}>kcal</div>
                         </div>
                        :<button className="tap" onClick={()=>{setMeal(m);setTab(1);}} style={{
                          width:34,height:34,borderRadius:10,border:"none",
                          background:"rgba(255,255,255,0.15)",color:C.text,fontSize:20,
                          cursor:"pointer",fontFamily:F,flexShrink:0,
                          display:"flex",alignItems:"center",justifyContent:"center",
                        }}>+</button>
                      }
                    </div>
                    {/* Progress bar (only when has food) */}
                    {hasFood&&(
                      <div style={{background:C.surface,padding:"8px 14px 10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                          <span style={{fontSize:10,color:C.textSec,fontWeight:600}}>{Math.round(p2)}% de tu meta diaria</span>
                          <span style={{fontSize:10,color:C.textSec,fontWeight:600}}>P:{Math.round(items.reduce((s,r)=>s+r.prot*r.qty,0))}g · C:{Math.round(items.reduce((s,r)=>s+r.carbs*r.qty,0))}g</span>
                        </div>
                        <div style={{height:5,background:C.bg,borderRadius:5,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${p2}%`,background:`linear-gradient(90deg,${MC[m]}aa,${MC[m]})`,borderRadius:5,transition:"width .5s ease"}}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {log.length===0&&(
              <div style={{textAlign:"center",padding:"14px 0"}}>
                <div style={{fontSize:12,color:C.textMuted,fontWeight:500,marginBottom:10}}>Aún no has registrado nada hoy 🌱</div>
                <button className="tap" onClick={()=>setTab(1)} style={{
                  background:`linear-gradient(135deg,${C.primary},${C.primaryMid})`,color:"white",border:"none",
                  borderRadius:14,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F,
                  boxShadow:"0 4px 14px rgba(40,92,62,0.35)",
                }}>Agregar primera comida</button>
              </div>
            )}
          </div>

        </div>}

        {/* ══════════ TAB 1: AGREGAR ══════════ */}
        {tab===1&&<div className="tab-anim">
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:14,scrollbarWidth:"none"}}>
            {MEALS.map(m=>(
              <button key={m} className="tap" onClick={()=>setMeal(m)} style={{
                flexShrink:0,display:"flex",alignItems:"center",gap:5,
                padding:"8px 14px",borderRadius:20,border:"none",fontFamily:F,
                background:meal===m?MC[m]:C.surface,
                color:meal===m?"#fff":C.textSec,
                fontSize:13,fontWeight:700,cursor:"pointer",
                boxShadow:meal===m?`0 4px 14px ${MC[m]}50`:`0 1px 6px rgba(0,0,0,${dark?.15:.06})`,
                transition:"all .2s ease",
              }}>
                <span>{MI[m]}</span>{m}
              </button>
            ))}
          </div>
          <div style={{position:"relative",marginBottom:10}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:.4,pointerEvents:"none"}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Buscar producto o marca..."
              style={{
                width:"100%",padding:"12px 40px 12px 42px",
                border:`1.5px solid ${q?C.primary:C.border}`,
                borderRadius:16,background:C.surface,
                fontSize:14,fontFamily:F,color:C.text,outline:"none",
                boxShadow:q?"0 0 0 3px rgba(40,92,62,0.1)":"none",
                transition:"all .2s ease",fontWeight:500,
              }}/>
            {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.textMuted,lineHeight:1}}>×</button>}
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:12,scrollbarWidth:"none"}}>
            {CATS.map(c=>(
              <button key={c} className="tap" onClick={()=>setCat(c)} style={{
                flexShrink:0,padding:"5px 13px",borderRadius:14,
                border:cat===c?"none":`1.5px solid ${C.border}`,
                background:cat===c?C.primary:C.surface,
                color:cat===c?"white":C.textSec,
                fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F,transition:"all .15s ease",
              }}>{c}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:10}}>{foods.length} productos</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {foods.length===0&&(
              <div style={{textAlign:"center",padding:"50px 0"}}>
                <div style={{fontSize:36,marginBottom:10}}>🤷</div>
                <div style={{fontSize:14,fontWeight:700,color:C.textSec}}>Sin resultados para "{q}"</div>
              </div>
            )}
            {foods.map(a=>{
              const inLog=log.find(r=>r.id===a.id&&r.comida===meal);
              return (
                <div key={a.id} className="food-card" onClick={()=>add(a)} style={{
                  display:"flex",alignItems:"center",gap:12,
                  background:C.surface,borderRadius:18,padding:"12px 14px",
                  border:`2px solid ${inLog?MC[meal]:"transparent"}`,
                  boxShadow:inLog?`0 4px 16px ${MC[meal]}28`:`0 2px 10px rgba(0,0,0,${dark?.12:.07})`,
                  transition:"all .2s ease",cursor:"pointer",
                }}>
                  <div style={{width:46,height:46,borderRadius:14,background:inLog?`${MC[meal]}18`:C.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{a.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.nombre}</div>
                    <div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginTop:1}}>{a.marca} · {a.cat}</div>
                    <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.primary}}>{a.cal} kcal</span>
                      {MACROS.map(({k,lS,c})=>(
                        <span key={k} style={{fontSize:10,fontWeight:700,color:c,background:`${c}22`,padding:"1px 6px",borderRadius:6}}>{lS[0]}:{a[k]}g</span>
                      ))}
                    </div>
                  </div>
                  <div style={{width:36,height:36,borderRadius:11,background:inLog?MC[meal]:C.primary,color:"white",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 12px ${inLog?MC[meal]:C.primary}50`,transition:"all .2s"}}>+</div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* ══════════ TAB 2: MI DÍA ══════════ */}
        {tab===2&&<div className="tab-anim">
          <div style={{background:`linear-gradient(145deg,${C.primary},${C.primaryDark})`,borderRadius:22,padding:"16px 18px",marginBottom:14,boxShadow:"0 8px 28px rgba(0,0,0,0.22)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:600,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Resumen del día</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,textAlign:"center"}}>
              {[{l:"Kcal",v:Math.round(tot.cal),m:metas.cal,c:"#fff"},{l:"Prot",v:Math.round(tot.prot),m:metas.prot,c:"#FF9B8A"},{l:"Carbs",v:Math.round(tot.carbs),m:metas.carbs,c:"#FFD08A"},{l:"Grasas",v:Math.round(tot.grasas),m:metas.grasas,c:"#FFA8CE"},{l:"Fibra",v:Math.round(tot.fibra),m:25,c:"#7ADEA0"}].map(({l,v,m,c})=>(
                <div key={l}>
                  <div style={{color:c,fontSize:15,fontWeight:800,lineHeight:1}}>{v}</div>
                  <div style={{color:"rgba(255,255,255,0.28)",fontSize:8,margin:"2px 0"}}>/{m}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:9,fontWeight:700}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {log.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:52,marginBottom:12}}>📋</div>
              <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>¡Tu diario está vacío!</div>
              <div style={{fontSize:13,color:C.textSec,marginBottom:18,fontWeight:500}}>Ve a "Agregar" para registrar</div>
              <button className="tap" onClick={()=>setTab(1)} style={{background:C.primary,color:"white",border:"none",borderRadius:16,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F}}>Ir a Agregar</button>
            </div>
          ):<>
            {MEALS.map(m=>{
              const items=log.filter(r=>r.comida===m);
              if(!items.length) return null;
              const mc=items.reduce((s,r)=>({cal:s.cal+r.cal*r.qty,prot:s.prot+r.prot*r.qty,carbs:s.carbs+r.carbs*r.qty,grasas:s.grasas+r.grasas*r.qty}),{cal:0,prot:0,carbs:0,grasas:0});
              return (
                <div key={m} style={{marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${MC[m]},${MC[m]}CC)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 3px 10px ${MC[m]}50`}}>{MI[m]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.text,lineHeight:1}}>{m}</div>
                      <div style={{fontSize:10,color:C.textSec,fontWeight:600,marginTop:1}}>{Math.round(mc.cal)} kcal · P:{Math.round(mc.prot)}g C:{Math.round(mc.carbs)}g G:{Math.round(mc.grasas)}g</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:MC[m]}}>{Math.round(mc.cal)} kcal</span>
                  </div>
                  {items.map(item=>(
                    <div key={item.uid} style={{display:"flex",alignItems:"center",gap:10,background:C.surface,borderRadius:18,padding:"11px 14px",marginBottom:6,boxShadow:`0 2px 10px rgba(0,0,0,${dark?.12:.07})`,borderLeft:`3px solid ${MC[m]}`}}>
                      <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.nombre}</div>
                        <div style={{display:"flex",gap:5,marginTop:3}}>
                          <span style={{fontSize:11,fontWeight:800,color:C.primary}}>{Math.round(item.cal*item.qty)} kcal</span>
                          <span style={{fontSize:10,color:"#C94B35",fontWeight:600}}>P:{Math.round(item.prot*item.qty)}g</span>
                          <span style={{fontSize:10,color:"#C07C24",fontWeight:600}}>C:{Math.round(item.carbs*item.qty)}g</span>
                        </div>
                      </div>
                      <Stepper value={item.qty} onDec={()=>adj(item.uid,-1)} onInc={()=>adj(item.uid,1)}/>
                    </div>
                  ))}
                </div>
              );
            })}
            <button className="tap" onClick={()=>setLog([])} style={{width:"100%",padding:"12px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.surface,color:"#C94B35",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F,marginTop:4}}>🗑️ Reiniciar el día</button>
          </>}
        </div>}

        {/* ══════════ TAB 3: OBJETIVOS ══════════ */}
        {tab===3&&<div className="tab-anim">

          {/* Profile */}
          <div style={{background:C.surface,borderRadius:22,padding:"18px",marginBottom:12,boxShadow:`0 2px 12px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>👤 Mi perfil</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{lbl:"Peso (kg)",k:"peso"},{lbl:"Altura (cm)",k:"altura"}].map(({lbl,k})=>(
                <div key={k}>
                  <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{lbl}</div>
                  <input type="number" value={perfil[k]} onChange={e=>setPerfil({...perfil,[k]:Number(e.target.value)})}
                    style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:16,fontFamily:F,outline:"none",fontWeight:800,color:C.text,background:C.surfaceAlt}}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Edad</div>
                <input type="number" value={perfil.edad} onChange={e=>setPerfil({...perfil,edad:Number(e.target.value)})}
                  style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:16,fontFamily:F,outline:"none",fontWeight:800,color:C.text,background:C.surfaceAlt}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Sexo</div>
                <div style={{display:"flex",gap:6}}>
                  {[{v:"M",l:"♂ Hombre"},{v:"F",l:"♀ Mujer"}].map(({v,l})=>(
                    <button key={v} className="tap" onClick={()=>setPerfil({...perfil,sexo:v})} style={{
                      flex:1,padding:"10px 4px",borderRadius:13,border:"none",
                      background:perfil.sexo===v?C.primary:C.surfaceAlt,
                      color:perfil.sexo===v?"white":C.textSec,
                      fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:F,
                    }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Actividad física</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {[{v:"1.2",l:"🛋️",lbl:"Sedentario",sub:"Sin ejercicio"},{v:"1.375",l:"🚶",lbl:"Ligero",sub:"1–2 días/sem"},{v:"1.55",l:"🏃",lbl:"Moderado",sub:"3–5 días/sem"},{v:"1.725",l:"💪",lbl:"Activo",sub:"6–7 días/sem"},{v:"1.9",l:"🔥",lbl:"Muy activo",sub:"Trabajo físico"}].map(({v,l,lbl,sub})=>(
                  <button key={v} className="tap" onClick={()=>setPerfil({...perfil,act:v})} style={{
                    padding:"10px 14px",borderRadius:13,
                    border:`1.5px solid ${perfil.act===v?C.primary:C.border}`,
                    background:perfil.act===v?`${C.primary}18`:C.surfaceAlt,
                    color:perfil.act===v?C.primary:C.textSec,
                    fontSize:12,fontWeight:perfil.act===v?800:500,
                    cursor:"pointer",fontFamily:F,textAlign:"left",
                    display:"flex",alignItems:"center",gap:10,transition:"all .15s",
                  }}>
                    <span style={{fontSize:18,width:24,textAlign:"center",flexShrink:0}}>{l}</span>
                    <span style={{fontWeight:700}}>{lbl}</span>
                    <span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginTop:14,background:`linear-gradient(135deg,#E07B4A,#C05D30)`,borderRadius:16,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 6px 18px rgba(224,123,74,0.3)"}}>
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Tu TDEE</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:500,marginTop:2}}>Calorías quemadas / día</div>
              </div>
              <div>
                <span style={{fontSize:32,fontWeight:800,color:"#fff"}}>{tdee}</span>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.55)"}}> kcal</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div style={{background:C.surface,borderRadius:22,padding:"18px",marginBottom:12,boxShadow:`0 2px 12px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>🎯 Mi objetivo</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[{k:"bajar",icon:"🔥",lbl:"Bajar de peso",sub:"Déficit −500 kcal",c:"#C94B35",bg:"#FBE9E6"},{k:"mantener",icon:"⚖️",lbl:"Mantener peso",sub:"= Tu TDEE",c:"#4A86C8",bg:"#E8F0FB"},{k:"recomp",icon:"💪",lbl:"Recomposición",sub:"TDEE + alta prot.",c:"#7C5CBF",bg:"#F0EBFB"},{k:"subir",icon:"📈",lbl:"Ganar masa",sub:"Superávit +300",c:"#3A9E6A",bg:"#E7F5ED"}].map(({k,icon,lbl,sub,c,bg})=>(
                <button key={k} className="tap" onClick={()=>setObj(k)} style={{
                  padding:"14px 10px",borderRadius:18,
                  border:`2px solid ${obj===k?c:C.border}`,
                  background:obj===k?(dark?`${c}25`:bg):C.surfaceAlt,
                  cursor:"pointer",fontFamily:F,textAlign:"center",
                  boxShadow:obj===k?`0 4px 16px ${c}25`:"none",transition:"all .2s",
                }}>
                  <div style={{fontSize:26,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:12,fontWeight:800,color:obj===k?c:C.textSec,lineHeight:1.2}}>{lbl}</div>
                  <div style={{fontSize:9,color:C.textMuted,fontWeight:600,marginTop:3}}>{sub}</div>
                </button>
              ))}
            </div>
            <div style={{background:C.bg,borderRadius:16,padding:"14px"}}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Metas diarias recomendadas</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {[{lbl:"Calorías",v:metas.cal,u:"kcal",bg:C.primary},{lbl:"Proteínas",v:metas.prot,u:"g",bg:"#C94B35"},{lbl:"Carbos",v:metas.carbs,u:"g",bg:"#C07C24"},{lbl:"Grasas",v:metas.grasas,u:"g",bg:"#9B4F72"}].map(({lbl,v,u,bg})=>(
                  <div key={lbl} style={{background:bg,borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
                    <div style={{color:"#fff",fontSize:17,fontWeight:800,lineHeight:1}}>{v}</div>
                    <div style={{color:"rgba(255,255,255,0.45)",fontSize:8,margin:"2px 0"}}>{u}</div>
                    <div style={{color:"rgba(255,255,255,0.6)",fontSize:8,fontWeight:700}}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diet plans */}
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>🥗 Planes sugeridos</div>
          {DIETAS.map(d=>(
            <div key={d.id} style={{background:C.surface,borderRadius:22,marginBottom:10,border:`2px solid ${expanded===d.id?d.color:C.border}`,boxShadow:expanded===d.id?`0 6px 24px ${d.color}22`:`0 2px 10px rgba(0,0,0,${dark?.12:.06})`,overflow:"hidden",transition:"all .2s"}}>
              <div style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setExpand(expanded===d.id?null:d.id)}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:50,height:50,borderRadius:15,background:`${d.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{d.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.text}}>{d.nombre}</div>
                    <div style={{fontSize:11,color:C.textSec,fontWeight:500,marginTop:2}}>{d.desc}</div>
                    <div style={{display:"flex",gap:6,marginTop:6}}>
                      <span style={{fontSize:10,background:`${d.color}18`,color:d.color,padding:"3px 9px",borderRadius:10,fontWeight:800}}>{d.cals}</span>
                      <span style={{fontSize:10,color:C.textMuted,fontWeight:500}}>{d.macros}</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:expanded===d.id?d.color:C.textMuted,transition:"transform .2s",transform:expanded===d.id?"rotate(180deg)":"rotate(0deg)"}}>▾</div>
                </div>
              </div>
              {expanded===d.id&&(
                <div style={{padding:"0 16px 16px",borderTop:`1.5px solid ${C.border}`}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.text,margin:"12px 0 8px"}}>✅ Reglas clave</div>
                  {d.reglas.map((r,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
                      <span style={{color:d.color,fontSize:12,flexShrink:0,lineHeight:1.5}}>●</span>
                      <span style={{fontSize:11,color:C.textSec,fontWeight:600,lineHeight:1.5}}>{r}</span>
                    </div>
                  ))}
                  <div style={{fontSize:11,fontWeight:800,color:C.text,margin:"12px 0 10px"}}>🗓️ Menú ejemplo</div>
                  {d.menu.map((m,i)=>(
                    <div key={i} style={{marginBottom:6,padding:"10px 12px",background:C.surfaceAlt,borderRadius:13,borderLeft:`3px solid ${d.color}`}}>
                      <div style={{fontSize:11,fontWeight:800,color:d.color,marginBottom:2}}>{m.t}</div>
                      <div style={{fontSize:11,color:C.textSec,fontWeight:500,lineHeight:1.4}}>{m.d}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>}

      </div>

      {/* ══ BOTTOM NAV ══ */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:30,background:C.navBg,backdropFilter:"blur(14px)",borderTop:`1px solid ${C.border}`,padding:"8px 8px 22px",display:"flex",transition:"background .3s"}}>
        {[{icon:"🏠",lbl:"Inicio"},{icon:"➕",lbl:"Agregar"},{icon:"📋",lbl:"Mi Día"},{icon:"🎯",lbl:"Objetivos"}].map(({icon,lbl},i)=>(
          <button key={i} className="tap" onClick={()=>setTab(i)} style={{flex:1,border:"none",background:"none",cursor:"pointer",fontFamily:F,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0"}}>
            <div style={{width:46,height:34,borderRadius:12,background:tab===i?`${C.primary}22`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:tab===i?22:19,transition:"all .2s"}}>{icon}</div>
            <div style={{fontSize:10,fontWeight:tab===i?800:500,color:tab===i?C.primary:C.textMuted,transition:"color .2s"}}>{lbl}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
