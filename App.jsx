import { useState, useMemo, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   BASE DE DATOS — 300+ productos supermercados chilenos
   porcion = gramos de la porción de referencia
═══════════════════════════════════════════════════════ */
const DB = [
  /* ── LÁCTEOS ── */
  {id:1,  nombre:"Leche entera Soprole",          marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:160, prot:8,   carbs:12,  grasas:9,   fibra:0,   emoji:"🥛"},
  {id:2,  nombre:"Leche semidescremada Soprole",  marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:120, prot:9,   carbs:12,  grasas:4.5, fibra:0,   emoji:"🥛"},
  {id:3,  nombre:"Leche descremada Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:90,  prot:9,   carbs:12,  grasas:0.5, fibra:0,   emoji:"🥛"},
  {id:4,  nombre:"Leche entera Colun",            marca:"Colun",        cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:11,  grasas:8.5, fibra:0,   emoji:"🥛"},
  {id:5,  nombre:"Leche semidescremada Colun",    marca:"Colun",        cat:"Lácteos",    porcion:250, cal:118, prot:9,   carbs:12,  grasas:4,   fibra:0,   emoji:"🥛"},
  {id:6,  nombre:"Leche entera Loncoleche",       marca:"Loncoleche",   cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:12,  grasas:9,   fibra:0,   emoji:"🥛"},
  {id:7,  nombre:"Leche de avena Oatly",          marca:"Oatly",        cat:"Lácteos",    porcion:250, cal:120, prot:3,   carbs:16,  grasas:5,   fibra:1.5, emoji:"🥛"},
  {id:8,  nombre:"Leche de almendra Blue Diamond",marca:"Blue Diamond", cat:"Lácteos",    porcion:250, cal:50,  prot:1.5, carbs:4,   grasas:3,   fibra:0.5, emoji:"🥛"},
  {id:9,  nombre:"Leche de soja Alpro",           marca:"Alpro",        cat:"Lácteos",    porcion:250, cal:95,  prot:8,   carbs:7,   grasas:4,   fibra:0.5, emoji:"🥛"},
  {id:10, nombre:"Leche de coco Aroy-D (200ml)",  marca:"Aroy-D",       cat:"Lácteos",    porcion:200, cal:280, prot:3,   carbs:4,   grasas:28,  fibra:0,   emoji:"🥥"},
  {id:11, nombre:"Yogurt natural Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:120, prot:7,   carbs:14,  grasas:4,   fibra:0,   emoji:"🥣"},
  {id:12, nombre:"Yogurt con fruta Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:140, prot:6,   carbs:20,  grasas:3.5, fibra:0,   emoji:"🥣"},
  {id:13, nombre:"Yogurt 0% Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:80,  prot:8,   carbs:12,  grasas:0,   fibra:0,   emoji:"🥣"},
  {id:14, nombre:"Yogurt natural Colun",          marca:"Colun",        cat:"Lácteos",    porcion:150, cal:135, prot:6,   carbs:15,  grasas:5,   fibra:0,   emoji:"🥣"},
  {id:15, nombre:"Yogurt griego Danone",          marca:"Danone",       cat:"Lácteos",    porcion:150, cal:135, prot:10,  carbs:13,  grasas:4,   fibra:0,   emoji:"🥣"},
  {id:16, nombre:"Yogurt griego 0% Danone",       marca:"Danone",       cat:"Lácteos",    porcion:150, cal:85,  prot:10,  carbs:13,  grasas:0,   fibra:0,   emoji:"🥣"},
  {id:17, nombre:"Yogurt bebible Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:200, cal:160, prot:6,   carbs:26,  grasas:3,   fibra:0,   emoji:"🥤"},
  {id:18, nombre:"Kéfir natural Colun",           marca:"Colun",        cat:"Lácteos",    porcion:150, cal:110, prot:7,   carbs:12,  grasas:3.5, fibra:0,   emoji:"🥣"},
  {id:19, nombre:"Queso gauda Colun",             marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:105, prot:7,   carbs:0.5, grasas:8.5, fibra:0,   emoji:"🧀"},
  {id:20, nombre:"Queso chanco Colun",            marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:95,  prot:6,   carbs:1,   grasas:8,   fibra:0,   emoji:"🧀"},
  {id:21, nombre:"Queso mantecoso Colun",         marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:1,   grasas:8,   fibra:0,   emoji:"🧀"},
  {id:22, nombre:"Queso laminado Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:25,  cal:80,  prot:5.5, carbs:0.5, grasas:6.5, fibra:0,   emoji:"🧀"},
  {id:23, nombre:"Queso crema Philadelphia",      marca:"Kraft",        cat:"Lácteos",    porcion:30,  cal:90,  prot:2,   carbs:1.5, grasas:9,   fibra:0,   emoji:"🧀"},
  {id:24, nombre:"Queso crema Soprole",           marca:"Soprole",      cat:"Lácteos",    porcion:30,  cal:85,  prot:2,   carbs:2,   grasas:8,   fibra:0,   emoji:"🧀"},
  {id:25, nombre:"Ricotta Soprole",               marca:"Soprole",      cat:"Lácteos",    porcion:50,  cal:80,  prot:5,   carbs:2,   grasas:6,   fibra:0,   emoji:"🧀"},
  {id:26, nombre:"Queso brie importado",          marca:"Genérico",     cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:0,   grasas:8.5, fibra:0,   emoji:"🧀"},
  {id:27, nombre:"Queso parmesano rallado",       marca:"Genérico",     cat:"Lácteos",    porcion:15,  cal:55,  prot:5,   carbs:0,   grasas:4,   fibra:0,   emoji:"🧀"},
  {id:28, nombre:"Manjar Colun",                  marca:"Colun",        cat:"Lácteos",    porcion:15,  cal:55,  prot:1,   carbs:12,  grasas:0.5, fibra:0,   emoji:"🍯"},
  {id:29, nombre:"Mantequilla Colun",             marca:"Colun",        cat:"Lácteos",    porcion:10,  cal:72,  prot:0.1, carbs:0,   grasas:8,   fibra:0,   emoji:"🧈"},
  {id:30, nombre:"Margarina Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:10,  cal:62,  prot:0,   carbs:0,   grasas:7,   fibra:0,   emoji:"🧈"},
  {id:31, nombre:"Crema Soprole",                 marca:"Soprole",      cat:"Lácteos",    porcion:100, cal:330, prot:2.5, carbs:3,   grasas:35,  fibra:0,   emoji:"🫙"},

  /* ── CARNES ── */
  {id:40, nombre:"Pechuga de pollo Ariztía",      marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:110, prot:23,  carbs:0,   grasas:1.5, fibra:0,   emoji:"🍗"},
  {id:41, nombre:"Trutro de pollo Ariztía",       marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:185, prot:18,  carbs:0,   grasas:12,  fibra:0,   emoji:"🍗"},
  {id:42, nombre:"Pechuga Super Pollo",           marca:"Super Pollo",  cat:"Carnes",     porcion:100, cal:108, prot:22,  carbs:0,   grasas:2,   fibra:0,   emoji:"🍗"},
  {id:43, nombre:"Filete de pollo congelado",     marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:112, prot:22,  carbs:1,   grasas:2,   fibra:0,   emoji:"🍗"},
  {id:44, nombre:"Filete de vacuno",              marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:27,  carbs:0,   grasas:7,   fibra:0,   emoji:"🥩"},
  {id:45, nombre:"Lomo de vacuno",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:215, prot:26,  carbs:0,   grasas:12,  fibra:0,   emoji:"🥩"},
  {id:46, nombre:"Asado de tira",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:24,  carbs:0,   grasas:17,  fibra:0,   emoji:"🥩"},
  {id:47, nombre:"Palanca de vacuno",             marca:"Natural",      cat:"Carnes",     porcion:100, cal:180, prot:25,  carbs:0,   grasas:9,   fibra:0,   emoji:"🥩"},
  {id:48, nombre:"Punta de ganso",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:160, prot:26,  carbs:0,   grasas:5.5, fibra:0,   emoji:"🥩"},
  {id:49, nombre:"Punta picana",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:25,  carbs:0,   grasas:10,  fibra:0,   emoji:"🥩"},
  {id:50, nombre:"Carne molida 80% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:255, prot:17,  carbs:0,   grasas:20,  fibra:0,   emoji:"🥩"},
  {id:51, nombre:"Carne molida 90% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:20,  carbs:0,   grasas:10,  fibra:0,   emoji:"🥩"},
  {id:52, nombre:"Cerdo chuleta",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:24,  carbs:0,   grasas:10,  fibra:0,   emoji:"🥩"},
  {id:53, nombre:"Lomo de cerdo",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:165, prot:25,  carbs:0,   grasas:6.5, fibra:0,   emoji:"🥩"},
  {id:54, nombre:"Plateada de vacuno",            marca:"Natural",      cat:"Carnes",     porcion:100, cal:290, prot:22,  carbs:0,   grasas:22,  fibra:0,   emoji:"🥩"},
  {id:55, nombre:"Pavo pechuga",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:105, prot:24,  carbs:0,   grasas:1,   fibra:0,   emoji:"🍗"},
  {id:56, nombre:"Cordero pierna",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:25,  carbs:0,   grasas:16,  fibra:0,   emoji:"🥩"},
  {id:57, nombre:"Hamburguesa vacuno 150g",       marca:"Genérico",     cat:"Carnes",     porcion:150, cal:380, prot:26,  carbs:0,   grasas:30,  fibra:0,   emoji:"🍔"},
  {id:58, nombre:"Hamburguesa pollo Ariztía 85g", marca:"Ariztía",      cat:"Carnes",     porcion:85,  cal:190, prot:14,  carbs:5,   grasas:13,  fibra:0,   emoji:"🍔"},

  /* ── CECINAS ── */
  {id:60, nombre:"Vienesa San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:40,  cal:130, prot:6,   carbs:2,   grasas:11,  fibra:0,   emoji:"🌭"},
  {id:61, nombre:"Vienesa Otto Kunkel",           marca:"Otto Kunkel",  cat:"Cecinas",    porcion:40,  cal:135, prot:6,   carbs:2,   grasas:11.5,fibra:0,   emoji:"🌭"},
  {id:62, nombre:"Jamón de pavo San Jorge",       marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:30,  prot:5.5, carbs:0.5, grasas:0.7, fibra:0,   emoji:"🥩"},
  {id:63, nombre:"Jamón de cerdo San Jorge",      marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:50,  prot:5,   carbs:0.5, grasas:3,   fibra:0,   emoji:"🥩"},
  {id:64, nombre:"Mortadela San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:70,  prot:4,   carbs:2,   grasas:5.5, fibra:0,   emoji:"🥩"},
  {id:65, nombre:"Salame Montserrat",             marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:110, prot:7,   carbs:0.5, grasas:9,   fibra:0,   emoji:"🥩"},
  {id:66, nombre:"Jamón serrano Montserrat",      marca:"Montserrat",   cat:"Cecinas",    porcion:25,  cal:55,  prot:7,   carbs:0,   grasas:3,   fibra:0,   emoji:"🥩"},
  {id:67, nombre:"Paté hígado Montserrat",        marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:100, prot:5,   carbs:1,   grasas:9,   fibra:0,   emoji:"🫙"},
  {id:68, nombre:"Chorizo San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:50,  cal:165, prot:8,   carbs:2,   grasas:14,  fibra:0,   emoji:"🌭"},
  {id:69, nombre:"Tocino ahumado",                marca:"Genérico",     cat:"Cecinas",    porcion:30,  cal:130, prot:5,   carbs:0.5, grasas:12,  fibra:0,   emoji:"🥓"},
  {id:70, nombre:"Pepperoni San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:30,  cal:120, prot:6,   carbs:1,   grasas:10,  fibra:0,   emoji:"🥩"},

  /* ── PANES ── */
  {id:80, nombre:"Marraqueta",                    marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:230, prot:7,   carbs:44,  grasas:2.5, fibra:2,   emoji:"🍞"},
  {id:81, nombre:"Hallulla",                      marca:"Artesanal",    cat:"Panes",      porcion:70,  cal:200, prot:6,   carbs:38,  grasas:3,   fibra:1.5, emoji:"🫓"},
  {id:82, nombre:"Pan molde blanco Harry's",      marca:"Harry's",      cat:"Panes",      porcion:30,  cal:75,  prot:2.5, carbs:14,  grasas:1,   fibra:0.5, emoji:"🍞"},
  {id:83, nombre:"Pan molde integral Harry's",    marca:"Harry's",      cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:0.8, fibra:2,   emoji:"🍞"},
  {id:84, nombre:"Pan molde Bimbo blanco",        marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:72,  prot:2.5, carbs:14,  grasas:0.8, fibra:0.5, emoji:"🍞"},
  {id:85, nombre:"Pan molde Bimbo integral",      marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:1,   fibra:2.5, emoji:"🍞"},
  {id:86, nombre:"Pan de molde sin gluten Schär", marca:"Schär",        cat:"Panes",      porcion:35,  cal:90,  prot:2.5, carbs:17,  grasas:1.5, fibra:1,   emoji:"🍞"},
  {id:87, nombre:"Pan pita Ideal",                marca:"Ideal",        cat:"Panes",      porcion:60,  cal:155, prot:5,   carbs:30,  grasas:1.5, fibra:1,   emoji:"🫓"},
  {id:88, nombre:"Pan ciabatta",                  marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:215, prot:7,   carbs:41,  grasas:2,   fibra:1.5, emoji:"🥖"},
  {id:89, nombre:"Baguette",                      marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:220, prot:7,   carbs:43,  grasas:1.5, fibra:1.5, emoji:"🥖"},
  {id:90, nombre:"Sopaipilla",                    marca:"Artesanal",    cat:"Panes",      porcion:60,  cal:155, prot:3,   carbs:22,  grasas:6.5, fibra:1,   emoji:"🫓"},
  {id:91, nombre:"Tostadas de agua Luchetti",     marca:"Luchetti",     cat:"Panes",      porcion:20,  cal:75,  prot:2,   carbs:15,  grasas:0.5, fibra:0.5, emoji:"🍘"},
  {id:92, nombre:"Galletas de arroz Galletas",    marca:"Genérico",     cat:"Panes",      porcion:20,  cal:72,  prot:1.5, carbs:15,  grasas:0.5, fibra:0.5, emoji:"🍘"},
  {id:93, nombre:"Pan de centeno",                marca:"Artesanal",    cat:"Panes",      porcion:35,  cal:85,  prot:3,   carbs:16,  grasas:0.8, fibra:2.5, emoji:"🍞"},

  /* ── CEREALES ── */
  {id:100,nombre:"Avena Quaker tradicional",      marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:170, prot:6,   carbs:30,  grasas:3,   fibra:4,   emoji:"🌾"},
  {id:101,nombre:"Avena instantánea Quaker",      marca:"Quaker",       cat:"Cereales",   porcion:35,  cal:130, prot:4.5, carbs:23,  grasas:2.5, fibra:3,   emoji:"🌾"},
  {id:102,nombre:"Musli Quaker",                  marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:175, prot:4.5, carbs:32,  grasas:3.5, fibra:3.5, emoji:"🥣"},
  {id:103,nombre:"Granola Quaker miel",           marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:195, prot:4,   carbs:34,  grasas:5,   fibra:3,   emoji:"🥣"},
  {id:104,nombre:"Corn Flakes Nestlé",            marca:"Nestlé",       cat:"Cereales",   porcion:30,  cal:110, prot:2.5, carbs:25,  grasas:0.2, fibra:0.8, emoji:"🥣"},
  {id:105,nombre:"Fitness Nestlé",                marca:"Nestlé",       cat:"Cereales",   porcion:30,  cal:110, prot:3,   carbs:23,  grasas:0.8, fibra:1.5, emoji:"🥣"},
  {id:106,nombre:"Zucaritas Kellogg's",           marca:"Kellogg's",    cat:"Cereales",   porcion:30,  cal:115, prot:1.5, carbs:27,  grasas:0.2, fibra:0.5, emoji:"🐯"},
  {id:107,nombre:"Special K Kellogg's",           marca:"Kellogg's",    cat:"Cereales",   porcion:30,  cal:110, prot:3.5, carbs:22,  grasas:0.5, fibra:1,   emoji:"🥣"},
  {id:108,nombre:"Milo Nestlé polvo",             marca:"Nestlé",       cat:"Cereales",   porcion:20,  cal:80,  prot:3,   carbs:15,  grasas:1.2, fibra:0.5, emoji:"🍫"},
  {id:109,nombre:"Granola sin azúcar",            marca:"Genérico",     cat:"Cereales",   porcion:45,  cal:185, prot:5,   carbs:28,  grasas:7,   fibra:4,   emoji:"🥣"},
  {id:110,nombre:"Weetabix",                      marca:"Weetabix",     cat:"Cereales",   porcion:37,  cal:130, prot:4.5, carbs:26,  grasas:0.7, fibra:3.5, emoji:"🥣"},

  /* ── SNACKS ── */
  {id:120,nombre:"Alfajor Costa",                 marca:"Costa",        cat:"Snacks",     porcion:42,  cal:190, prot:2.5, carbs:28,  grasas:8,   fibra:0.5, emoji:"🍪"},
  {id:121,nombre:"Galletas Tritón Costa",         marca:"Costa",        cat:"Snacks",     porcion:30,  cal:145, prot:1.5, carbs:21,  grasas:6,   fibra:0.5, emoji:"🍪"},
  {id:122,nombre:"Chocman Costa",                 marca:"Costa",        cat:"Snacks",     porcion:42,  cal:180, prot:2,   carbs:26,  grasas:8,   fibra:0.5, emoji:"🍫"},
  {id:123,nombre:"Turrón de Viena Costa",         marca:"Costa",        cat:"Snacks",     porcion:30,  cal:125, prot:1.5, carbs:20,  grasas:4.5, fibra:0.5, emoji:"🍫"},
  {id:124,nombre:"Oreo",                          marca:"Nabisco",      cat:"Snacks",     porcion:34,  cal:160, prot:1.5, carbs:25,  grasas:7,   fibra:0.5, emoji:"🍪"},
  {id:125,nombre:"Papas fritas Lays clásicas",    marca:"Lays",         cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:15,  grasas:10,  fibra:1,   emoji:"🥔"},
  {id:126,nombre:"Papas fritas Lays Max",         marca:"Lays",         cat:"Snacks",     porcion:28,  cal:155, prot:2,   carbs:14,  grasas:11,  fibra:1,   emoji:"🥔"},
  {id:127,nombre:"Pringles original",             marca:"Pringles",     cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:16,  grasas:9,   fibra:1,   emoji:"🥔"},
  {id:128,nombre:"Doritos nacho",                 marca:"Doritos",      cat:"Snacks",     porcion:28,  cal:140, prot:2,   carbs:18,  grasas:7,   fibra:1.5, emoji:"🌽"},
  {id:129,nombre:"Cheetos",                       marca:"Cheetos",      cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:15,  grasas:10,  fibra:0.5, emoji:"🧡"},
  {id:130,nombre:"Kuchen artesanal",              marca:"Artesanal",    cat:"Snacks",     porcion:80,  cal:340, prot:5,   carbs:42,  grasas:17,  fibra:1,   emoji:"🥧"},
  {id:131,nombre:"Maní tostado salado",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:175, prot:7,   carbs:6,   grasas:14,  fibra:2,   emoji:"🥜"},
  {id:132,nombre:"Almendras naturales",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:175, prot:6,   carbs:6,   grasas:15,  fibra:3.5, emoji:"🥜"},
  {id:133,nombre:"Nueces",                        marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:195, prot:4.5, carbs:4,   grasas:19,  fibra:2,   emoji:"🥜"},
  {id:134,nombre:"Pistachos",                     marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:170, prot:6,   carbs:8,   grasas:14,  fibra:3,   emoji:"🥜"},
  {id:135,nombre:"Pasas",                         marca:"Genérico",     cat:"Snacks",     porcion:40,  cal:120, prot:1,   carbs:32,  grasas:0.2, fibra:1.5, emoji:"🍇"},
  {id:136,nombre:"Mix de frutos secos",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:170, prot:4,   carbs:12,  grasas:13,  fibra:2,   emoji:"🥜"},
  {id:137,nombre:"Barra cereal Quaker",           marca:"Quaker",       cat:"Snacks",     porcion:35,  cal:130, prot:2,   carbs:25,  grasas:3,   fibra:1.5, emoji:"🍫"},
  {id:138,nombre:"Galletas María Luchetti",       marca:"Luchetti",     cat:"Snacks",     porcion:30,  cal:125, prot:2,   carbs:22,  grasas:3.5, fibra:0.5, emoji:"🍪"},
  {id:139,nombre:"Chocolate Sahne-Nuss",          marca:"Sahne-Nuss",   cat:"Snacks",     porcion:40,  cal:215, prot:4,   carbs:22,  grasas:13,  fibra:1.5, emoji:"🍫"},
  {id:140,nombre:"Chocolate Costa bitter 70%",    marca:"Costa",        cat:"Snacks",     porcion:30,  cal:165, prot:3,   carbs:14,  grasas:12,  fibra:2.5, emoji:"🍫"},

  /* ── BEBIDAS ── */
  {id:150,nombre:"Coca-Cola lata 350ml",          marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:148, prot:0,   carbs:37,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:151,nombre:"Coca-Cola Zero lata 350ml",     marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0,   emoji:"🥤"},
  {id:152,nombre:"Pepsi lata 350ml",              marca:"Pepsi",        cat:"Bebidas",    porcion:350, cal:145, prot:0,   carbs:36,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:153,nombre:"Fanta naranja lata 350ml",      marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:165, prot:0,   carbs:41,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:154,nombre:"Sprite lata 350ml",             marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:145, prot:0,   carbs:36,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:155,nombre:"Bilz lata 350ml",               marca:"CCU",          cat:"Bebidas",    porcion:350, cal:140, prot:0,   carbs:35,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:156,nombre:"Pap lata 350ml",                marca:"CCU",          cat:"Bebidas",    porcion:350, cal:130, prot:0,   carbs:33,  grasas:0,   fibra:0,   emoji:"🥤"},
  {id:157,nombre:"Gatorade 500ml",                marca:"Gatorade",     cat:"Bebidas",    porcion:500, cal:130, prot:0,   carbs:34,  grasas:0,   fibra:0,   emoji:"🏃"},
  {id:158,nombre:"Monster Energy 473ml",          marca:"Monster",      cat:"Bebidas",    porcion:473, cal:220, prot:0,   carbs:55,  grasas:0,   fibra:0,   emoji:"⚡"},
  {id:159,nombre:"Red Bull 250ml",                marca:"Red Bull",     cat:"Bebidas",    porcion:250, cal:115, prot:0,   carbs:28,  grasas:0,   fibra:0,   emoji:"🐂"},
  {id:160,nombre:"Cerveza Cristal lata 350ml",    marca:"CCU",          cat:"Bebidas",    porcion:350, cal:150, prot:1.5, carbs:14,  grasas:0,   fibra:0,   emoji:"🍺"},
  {id:161,nombre:"Cerveza Escudo lata 350ml",     marca:"CCU",          cat:"Bebidas",    porcion:350, cal:148, prot:1.5, carbs:13,  grasas:0,   fibra:0,   emoji:"🍺"},
  {id:162,nombre:"Cerveza Heineken 330ml",        marca:"Heineken",     cat:"Bebidas",    porcion:330, cal:150, prot:1.5, carbs:11,  grasas:0,   fibra:0,   emoji:"🍺"},
  {id:163,nombre:"Jugo Watts naranja 200ml",      marca:"Watts",        cat:"Bebidas",    porcion:200, cal:95,  prot:0.5, carbs:22,  grasas:0,   fibra:0,   emoji:"🧃"},
  {id:164,nombre:"Jugo Andina manzana 250ml",     marca:"Andina",       cat:"Bebidas",    porcion:250, cal:110, prot:0.5, carbs:26,  grasas:0,   fibra:0,   emoji:"🧃"},
  {id:165,nombre:"Jugo Watt's natural naranja",   marca:"Watt's",       cat:"Bebidas",    porcion:200, cal:88,  prot:1.5, carbs:20,  grasas:0,   fibra:0.5, emoji:"🍊"},
  {id:166,nombre:"Agua Cachantun 500ml",          marca:"Cachantun",    cat:"Bebidas",    porcion:500, cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"💧"},
  {id:167,nombre:"Agua con gas Cachantun 500ml",  marca:"Cachantun",    cat:"Bebidas",    porcion:500, cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"💧"},
  {id:168,nombre:"Café Nescafé negro",            marca:"Nestlé",       cat:"Bebidas",    porcion:240, cal:5,   prot:0.3, carbs:0.7, grasas:0,   fibra:0,   emoji:"☕"},
  {id:169,nombre:"Café con leche Nescafé",        marca:"Nestlé",       cat:"Bebidas",    porcion:240, cal:90,  prot:4,   carbs:12,  grasas:2.5, fibra:0,   emoji:"☕"},
  {id:170,nombre:"Té negro en bolsita",           marca:"Genérico",     cat:"Bebidas",    porcion:240, cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0,   emoji:"🍵"},
  {id:171,nombre:"Vino tinto copa 150ml",         marca:"Genérico",     cat:"Bebidas",    porcion:150, cal:125, prot:0,   carbs:4,   grasas:0,   fibra:0,   emoji:"🍷"},
  {id:172,nombre:"Vino blanco copa 150ml",        marca:"Genérico",     cat:"Bebidas",    porcion:150, cal:120, prot:0,   carbs:4,   grasas:0,   fibra:0,   emoji:"🥂"},
  {id:173,nombre:"Kombucha GT's 480ml",           marca:"GT's",         cat:"Bebidas",    porcion:480, cal:50,  prot:0,   carbs:12,  grasas:0,   fibra:0,   emoji:"🍶"},

  /* ── FRUTAS ── */
  {id:180,nombre:"Palta Hass",                    marca:"Natural",      cat:"Frutas",     porcion:80,  cal:130, prot:1.5, carbs:7,   grasas:12,  fibra:5,   emoji:"🥑"},
  {id:181,nombre:"Manzana fuji",                  marca:"Natural",      cat:"Frutas",     porcion:150, cal:80,  prot:0.5, carbs:20,  grasas:0.3, fibra:3,   emoji:"🍎"},
  {id:182,nombre:"Plátano",                       marca:"Natural",      cat:"Frutas",     porcion:120, cal:105, prot:1.5, carbs:27,  grasas:0.3, fibra:3,   emoji:"🍌"},
  {id:183,nombre:"Naranja navel",                 marca:"Natural",      cat:"Frutas",     porcion:200, cal:90,  prot:2,   carbs:22,  grasas:0,   fibra:4,   emoji:"🍊"},
  {id:184,nombre:"Frutillas",                     marca:"Natural",      cat:"Frutas",     porcion:150, cal:50,  prot:1,   carbs:12,  grasas:0.5, fibra:3,   emoji:"🍓"},
  {id:185,nombre:"Uva red globe",                 marca:"Natural",      cat:"Frutas",     porcion:100, cal:70,  prot:0.7, carbs:18,  grasas:0.2, fibra:1,   emoji:"🍇"},
  {id:186,nombre:"Durazno",                       marca:"Natural",      cat:"Frutas",     porcion:130, cal:50,  prot:1,   carbs:13,  grasas:0.3, fibra:2,   emoji:"🍑"},
  {id:187,nombre:"Lúcuma",                        marca:"Natural",      cat:"Frutas",     porcion:100, cal:99,  prot:1.5, carbs:23,  grasas:0.5, fibra:2,   emoji:"🍋"},
  {id:188,nombre:"Kiwi",                          marca:"Natural",      cat:"Frutas",     porcion:80,  cal:50,  prot:1,   carbs:12,  grasas:0.4, fibra:2.5, emoji:"🥝"},
  {id:189,nombre:"Chirimoya",                     marca:"Natural",      cat:"Frutas",     porcion:100, cal:75,  prot:1.5, carbs:18,  grasas:0.5, fibra:2.5, emoji:"🍈"},
  {id:190,nombre:"Sandía",                        marca:"Natural",      cat:"Frutas",     porcion:200, cal:60,  prot:1,   carbs:15,  grasas:0.2, fibra:1,   emoji:"🍉"},
  {id:191,nombre:"Melón",                         marca:"Natural",      cat:"Frutas",     porcion:200, cal:68,  prot:1.5, carbs:16,  grasas:0.3, fibra:1.5, emoji:"🍈"},
  {id:192,nombre:"Arándanos",                     marca:"Natural",      cat:"Frutas",     porcion:100, cal:57,  prot:0.7, carbs:14,  grasas:0.3, fibra:2.5, emoji:"🫐"},
  {id:193,nombre:"Frambuesas",                    marca:"Natural",      cat:"Frutas",     porcion:100, cal:52,  prot:1,   carbs:12,  grasas:0.7, fibra:6.5, emoji:"🍓"},
  {id:194,nombre:"Pera",                          marca:"Natural",      cat:"Frutas",     porcion:150, cal:85,  prot:0.5, carbs:23,  grasas:0.2, fibra:4,   emoji:"🍐"},
  {id:195,nombre:"Ciruela",                       marca:"Natural",      cat:"Frutas",     porcion:80,  cal:38,  prot:0.5, carbs:10,  grasas:0.1, fibra:1.5, emoji:"🍑"},
  {id:196,nombre:"Mango",                         marca:"Natural",      cat:"Frutas",     porcion:150, cal:95,  prot:1,   carbs:25,  grasas:0.4, fibra:2.5, emoji:"🥭"},
  {id:197,nombre:"Piña",                          marca:"Natural",      cat:"Frutas",     porcion:150, cal:78,  prot:0.9, carbs:20,  grasas:0.2, fibra:2,   emoji:"🍍"},

  /* ── VERDURAS ── */
  {id:200,nombre:"Tomate",                        marca:"Natural",      cat:"Verduras",   porcion:120, cal:25,  prot:1,   carbs:5,   grasas:0.3, fibra:1.5, emoji:"🍅"},
  {id:201,nombre:"Lechuga romana",                marca:"Natural",      cat:"Verduras",   porcion:80,  cal:14,  prot:1,   carbs:2,   grasas:0.2, fibra:1.5, emoji:"🥬"},
  {id:202,nombre:"Espinaca",                      marca:"Natural",      cat:"Verduras",   porcion:80,  cal:18,  prot:2.5, carbs:2,   grasas:0.3, fibra:1.5, emoji:"🥬"},
  {id:203,nombre:"Choclo",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:65,  prot:2,   carbs:14,  grasas:0.7, fibra:1.5, emoji:"🌽"},
  {id:204,nombre:"Zanahoria",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:41,  prot:0.9, carbs:10,  grasas:0.2, fibra:2.8, emoji:"🥕"},
  {id:205,nombre:"Cebolla",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:40,  prot:1,   carbs:9,   grasas:0.1, fibra:1.7, emoji:"🧅"},
  {id:206,nombre:"Papa blanca",                   marca:"Natural",      cat:"Verduras",   porcion:150, cal:120, prot:2.5, carbs:27,  grasas:0.2, fibra:2.5, emoji:"🥔"},
  {id:207,nombre:"Camote/batata",                 marca:"Natural",      cat:"Verduras",   porcion:150, cal:130, prot:2,   carbs:30,  grasas:0.2, fibra:4,   emoji:"🍠"},
  {id:208,nombre:"Brócoli",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:34,  prot:2.8, carbs:7,   grasas:0.4, fibra:2.6, emoji:"🥦"},
  {id:209,nombre:"Coliflor",                      marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:2,   carbs:5,   grasas:0.3, fibra:2,   emoji:"🥦"},
  {id:210,nombre:"Pepino",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.1, fibra:1,   emoji:"🥒"},
  {id:211,nombre:"Pimentón rojo",                 marca:"Natural",      cat:"Verduras",   porcion:120, cal:38,  prot:1.5, carbs:9,   grasas:0.3, fibra:3,   emoji:"🫑"},
  {id:212,nombre:"Pimentón verde",                marca:"Natural",      cat:"Verduras",   porcion:120, cal:30,  prot:1,   carbs:7,   grasas:0.2, fibra:2.5, emoji:"🫑"},
  {id:213,nombre:"Zapallo camote",                marca:"Natural",      cat:"Verduras",   porcion:100, cal:26,  prot:1,   carbs:6,   grasas:0.1, fibra:1.5, emoji:"🎃"},
  {id:214,nombre:"Berenjena",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:1,   carbs:6,   grasas:0.2, fibra:3,   emoji:"🍆"},
  {id:215,nombre:"Poroto verde",                  marca:"Natural",      cat:"Verduras",   porcion:100, cal:31,  prot:1.8, carbs:7,   grasas:0.1, fibra:2.7, emoji:"🫘"},
  {id:216,nombre:"Apio",                          marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.2, fibra:1.6, emoji:"🌿"},
  {id:217,nombre:"Champiñones",                   marca:"Natural",      cat:"Verduras",   porcion:100, cal:22,  prot:3,   carbs:3,   grasas:0.3, fibra:1,   emoji:"🍄"},
  {id:218,nombre:"Ajo",                           marca:"Natural",      cat:"Verduras",   porcion:10,  cal:15,  prot:0.6, carbs:3.4, grasas:0.1, fibra:0.2, emoji:"🧄"},

  /* ── LEGUMBRES ── */
  {id:225,nombre:"Lentejas cocidas Gallo",        marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:115, prot:9,   carbs:20,  grasas:0.4, fibra:8,   emoji:"🫘"},
  {id:226,nombre:"Porotos negros Gallo",          marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:130, prot:9,   carbs:24,  grasas:0.5, fibra:7,   emoji:"🫘"},
  {id:227,nombre:"Garbanzos cocidos",             marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:165, prot:9,   carbs:27,  grasas:2.5, fibra:8,   emoji:"🫘"},
  {id:228,nombre:"Porotos blancos cocidos",       marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:125, prot:8.5, carbs:23,  grasas:0.4, fibra:7,   emoji:"🫘"},
  {id:229,nombre:"Arvejas cocidas",               marca:"Natural",      cat:"Legumbres",  porcion:100, cal:84,  prot:5.5, carbs:15,  grasas:0.4, fibra:5,   emoji:"🫛"},
  {id:230,nombre:"Edamame",                       marca:"Natural",      cat:"Legumbres",  porcion:100, cal:121, prot:11,  carbs:10,  grasas:5,   fibra:5,   emoji:"🫛"},
  {id:231,nombre:"Hummus",                        marca:"Genérico",     cat:"Legumbres",  porcion:60,  cal:140, prot:5,   carbs:12,  grasas:8,   fibra:3.5, emoji:"🫙"},

  /* ── GRANOS / PASTAS / ARROZ ── */
  {id:235,nombre:"Arroz blanco cocido",           marca:"Genérico",     cat:"Granos",     porcion:100, cal:130, prot:2.7, carbs:28,  grasas:0.3, fibra:0.4, emoji:"🍚"},
  {id:236,nombre:"Arroz integral cocido",         marca:"Genérico",     cat:"Granos",     porcion:100, cal:110, prot:2.5, carbs:23,  grasas:0.8, fibra:1.8, emoji:"🍚"},
  {id:237,nombre:"Pasta Carozzi espagueti",       marca:"Carozzi",      cat:"Granos",     porcion:100, cal:360, prot:12,  carbs:72,  grasas:1.5, fibra:3,   emoji:"🍝"},
  {id:238,nombre:"Pasta Carozzi cocida",          marca:"Carozzi",      cat:"Granos",     porcion:100, cal:160, prot:5.5, carbs:32,  grasas:0.9, fibra:2,   emoji:"🍝"},
  {id:239,nombre:"Pasta integral Carozzi",        marca:"Carozzi",      cat:"Granos",     porcion:100, cal:345, prot:13,  carbs:68,  grasas:2,   fibra:8,   emoji:"🍝"},
  {id:240,nombre:"Pasta integral cocida",         marca:"Carozzi",      cat:"Granos",     porcion:100, cal:150, prot:6,   carbs:30,  grasas:1,   fibra:4,   emoji:"🍝"},
  {id:241,nombre:"Quinoa cocida",                 marca:"Genérico",     cat:"Granos",     porcion:100, cal:120, prot:4.5, carbs:21,  grasas:2,   fibra:2.8, emoji:"🌾"},
  {id:242,nombre:"Quinoa seca",                   marca:"Genérico",     cat:"Granos",     porcion:40,  cal:155, prot:6,   carbs:27,  grasas:2.5, fibra:3.5, emoji:"🌾"},
  {id:243,nombre:"Avena seca",                    marca:"Genérico",     cat:"Granos",     porcion:40,  cal:150, prot:5,   carbs:26,  grasas:2.5, fibra:3.5, emoji:"🌾"},
  {id:244,nombre:"Arroz seco Gallo",              marca:"Gallo",        cat:"Granos",     porcion:50,  cal:180, prot:3.5, carbs:40,  grasas:0.5, fibra:0.5, emoji:"🌾"},
  {id:245,nombre:"Cous cous cocido",              marca:"Genérico",     cat:"Granos",     porcion:100, cal:112, prot:3.8, carbs:23,  grasas:0.2, fibra:1.5, emoji:"🌾"},

  /* ── PESCADOS / MARISCOS ── */
  {id:250,nombre:"Reineta al horno",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:115, prot:20,  carbs:0,   grasas:3.5, fibra:0,   emoji:"🐟"},
  {id:251,nombre:"Salmón fresco",                 marca:"Natural",      cat:"Pescados",   porcion:100, cal:200, prot:20,  carbs:0,   grasas:13,  fibra:0,   emoji:"🐟"},
  {id:252,nombre:"Merluza al vapor",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:80,  prot:18,  carbs:0,   grasas:0.8, fibra:0,   emoji:"🐟"},
  {id:253,nombre:"Congrio colorado",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:95,  prot:19,  carbs:0,   grasas:2,   fibra:0,   emoji:"🐟"},
  {id:254,nombre:"Jurel en conserva",             marca:"Genérico",     cat:"Pescados",   porcion:100, cal:150, prot:22,  carbs:0,   grasas:7,   fibra:0,   emoji:"🥫"},
  {id:255,nombre:"Atún Salmonte en agua",         marca:"Salmonte",     cat:"Pescados",   porcion:100, cal:100, prot:23,  carbs:0,   grasas:1,   fibra:0,   emoji:"🥫"},
  {id:256,nombre:"Sardinas en aceite",            marca:"Genérico",     cat:"Pescados",   porcion:85,  cal:190, prot:23,  carbs:0,   grasas:11,  fibra:0,   emoji:"🥫"},
  {id:257,nombre:"Machas al natural",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:55,  prot:10,  carbs:3,   grasas:0.5, fibra:0,   emoji:"🦪"},
  {id:258,nombre:"Camarones cocidos",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:99,  prot:21,  carbs:0,   grasas:1,   fibra:0,   emoji:"🦐"},
  {id:259,nombre:"Albacora (pez espada)",         marca:"Natural",      cat:"Pescados",   porcion:100, cal:145, prot:20,  carbs:0,   grasas:7,   fibra:0,   emoji:"🐟"},
  {id:260,nombre:"Salmón ahumado",                marca:"Genérico",     cat:"Pescados",   porcion:50,  cal:85,  prot:11,  carbs:0,   grasas:4.5, fibra:0,   emoji:"🐟"},

  /* ── HUEVOS ── */
  {id:265,nombre:"Huevo entero grande",           marca:"Natural",      cat:"Huevos",     porcion:60,  cal:70,  prot:6,   carbs:0.5, grasas:5,   fibra:0,   emoji:"🥚"},
  {id:266,nombre:"Clara de huevo",                marca:"Natural",      cat:"Huevos",     porcion:30,  cal:17,  prot:3.5, carbs:0.2, grasas:0,   fibra:0,   emoji:"🥚"},
  {id:267,nombre:"Yema de huevo",                 marca:"Natural",      cat:"Huevos",     porcion:18,  cal:55,  prot:2.7, carbs:0.3, grasas:4.5, fibra:0,   emoji:"🥚"},
  {id:268,nombre:"Claras líquidas pasteurizadas", marca:"Genérico",     cat:"Huevos",     porcion:100, cal:52,  prot:11,  carbs:0.7, grasas:0.2, fibra:0,   emoji:"🥚"},

  /* ── ACEITES / GRASAS ── */
  {id:270,nombre:"Aceite de oliva extra virgen",  marca:"Chef",         cat:"Aceites",    porcion:15,  cal:135, prot:0,   carbs:0,   grasas:15,  fibra:0,   emoji:"🫙"},
  {id:271,nombre:"Aceite vegetal Mazola",         marca:"Mazola",       cat:"Aceites",    porcion:15,  cal:125, prot:0,   carbs:0,   grasas:14,  fibra:0,   emoji:"🫙"},
  {id:272,nombre:"Aceite de coco",                marca:"Genérico",     cat:"Aceites",    porcion:14,  cal:120, prot:0,   carbs:0,   grasas:14,  fibra:0,   emoji:"🥥"},
  {id:273,nombre:"Aceite de palta",               marca:"Genérico",     cat:"Aceites",    porcion:15,  cal:130, prot:0,   carbs:0,   grasas:14,  fibra:0,   emoji:"🥑"},

  /* ── COMIDAS CHILENAS ── */
  {id:280,nombre:"Empanada de pino horneada",     marca:"Artesanal",    cat:"Comidas CL", porcion:150, cal:360, prot:14,  carbs:38,  grasas:16,  fibra:2,   emoji:"🥟"},
  {id:281,nombre:"Empanada de queso horneada",    marca:"Artesanal",    cat:"Comidas CL", porcion:140, cal:310, prot:12,  carbs:35,  grasas:14,  fibra:1,   emoji:"🥟"},
  {id:282,nombre:"Empanada frita de queso",       marca:"Artesanal",    cat:"Comidas CL", porcion:140, cal:395, prot:12,  carbs:36,  grasas:22,  fibra:1,   emoji:"🥟"},
  {id:283,nombre:"Cazuela de vacuno",             marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:265, prot:22,  carbs:28,  grasas:7,   fibra:3,   emoji:"🍲"},
  {id:284,nombre:"Pastel de choclo",              marca:"Artesanal",    cat:"Comidas CL", porcion:300, cal:360, prot:15,  carbs:45,  grasas:14,  fibra:3,   emoji:"🫕"},
  {id:285,nombre:"Completo italiano",             marca:"Artesanal",    cat:"Comidas CL", porcion:250, cal:480, prot:15,  carbs:45,  grasas:26,  fibra:3,   emoji:"🌭"},
  {id:286,nombre:"Chorrillana individual",        marca:"Artesanal",    cat:"Comidas CL", porcion:450, cal:820, prot:30,  carbs:75,  grasas:44,  fibra:5,   emoji:"🍟"},
  {id:287,nombre:"Sopaipilla pasada",             marca:"Artesanal",    cat:"Comidas CL", porcion:80,  cal:180, prot:3,   carbs:32,  grasas:5,   fibra:1,   emoji:"🫓"},
  {id:288,nombre:"Mote con huesillos vaso",       marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:290, prot:4,   carbs:66,  grasas:0.5, fibra:3,   emoji:"🥤"},
  {id:289,nombre:"Humita",                        marca:"Artesanal",    cat:"Comidas CL", porcion:200, cal:210, prot:5,   carbs:38,  grasas:5,   fibra:3,   emoji:"🌽"},
  {id:290,nombre:"Charquicán",                    marca:"Artesanal",    cat:"Comidas CL", porcion:350, cal:290, prot:20,  carbs:38,  grasas:7,   fibra:5,   emoji:"🥘"},
  {id:291,nombre:"Porotos con riendas",           marca:"Artesanal",    cat:"Comidas CL", porcion:350, cal:320, prot:14,  carbs:55,  grasas:5,   fibra:12,  emoji:"🫘"},
  {id:292,nombre:"Arrollado de huaso",            marca:"Artesanal",    cat:"Comidas CL", porcion:80,  cal:180, prot:12,  carbs:2,   grasas:14,  fibra:0,   emoji:"🥩"},
  {id:293,nombre:"Prietas (100g)",                marca:"Artesanal",    cat:"Comidas CL", porcion:100, cal:280, prot:14,  carbs:8,   grasas:22,  fibra:0,   emoji:"🌑"},
  {id:294,nombre:"Milcao",                        marca:"Artesanal",    cat:"Comidas CL", porcion:100, cal:240, prot:4,   carbs:38,  grasas:9,   fibra:2,   emoji:"🫓"},
  {id:295,nombre:"Curanto en olla",               marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:520, prot:38,  carbs:40,  grasas:18,  fibra:4,   emoji:"🍲"},

  /* ── CONGELADOS ── */
  {id:300,nombre:"Nuggets de pollo Ariztía",      marca:"Ariztía",      cat:"Congelados", porcion:100, cal:240, prot:15,  carbs:16,  grasas:12,  fibra:0.5, emoji:"🍗"},
  {id:301,nombre:"Papas fritas congeladas McCain",marca:"McCain",       cat:"Congelados", porcion:100, cal:170, prot:2.5, carbs:25,  grasas:7,   fibra:2.5, emoji:"🍟"},
  {id:302,nombre:"Pizza Margherita congelada",    marca:"Genérico",     cat:"Congelados", porcion:150, cal:370, prot:14,  carbs:44,  grasas:15,  fibra:2,   emoji:"🍕"},
  {id:303,nombre:"Empanadas congeladas pino",     marca:"Genérico",     cat:"Congelados", porcion:150, cal:340, prot:12,  carbs:40,  grasas:14,  fibra:2,   emoji:"🥟"},
  {id:304,nombre:"Lasaña congelada",              marca:"Genérico",     cat:"Congelados", porcion:300, cal:390, prot:18,  carbs:40,  grasas:16,  fibra:2.5, emoji:"🍝"},
  {id:305,nombre:"Hamburguesa congelada Jumbo",   marca:"Jumbo",        cat:"Congelados", porcion:115, cal:280, prot:18,  carbs:5,   grasas:22,  fibra:0,   emoji:"🍔"},
  {id:306,nombre:"Brócoli congelado",             marca:"Genérico",     cat:"Congelados", porcion:100, cal:30,  prot:2.5, carbs:6,   grasas:0.3, fibra:2.5, emoji:"🥦"},
  {id:307,nombre:"Mix verduras congeladas",       marca:"Genérico",     cat:"Congelados", porcion:100, cal:55,  prot:3,   carbs:10,  grasas:0.3, fibra:3,   emoji:"🥦"},

  /* ── CONDIMENTOS ── */
  {id:310,nombre:"Azúcar Iansa",                  marca:"Iansa",        cat:"Condimentos",porcion:5,   cal:20,  prot:0,   carbs:5,   grasas:0,   fibra:0,   emoji:"🍬"},
  {id:311,nombre:"Miel de abeja natural",         marca:"Natural",      cat:"Condimentos",porcion:7,   cal:22,  prot:0,   carbs:6,   grasas:0,   fibra:0,   emoji:"🍯"},
  {id:312,nombre:"Mayonesa Hellmann's",           marca:"Hellmann's",   cat:"Condimentos",porcion:15,  cal:100, prot:0.1, carbs:0.5, grasas:11,  fibra:0,   emoji:"🫙"},
  {id:313,nombre:"Ketchup Malloa",                marca:"Malloa",       cat:"Condimentos",porcion:15,  cal:20,  prot:0.3, carbs:5,   grasas:0,   fibra:0.3, emoji:"🍅"},
  {id:314,nombre:"Mostaza Savora",                marca:"Savora",       cat:"Condimentos",porcion:10,  cal:12,  prot:0.5, carbs:1,   grasas:0.5, fibra:0.5, emoji:"🟡"},
  {id:315,nombre:"Mermelada Watts frutilla",      marca:"Watts",        cat:"Condimentos",porcion:20,  cal:45,  prot:0.1, carbs:11,  grasas:0,   fibra:0.3, emoji:"🍓"},
  {id:316,nombre:"Salsa de tomate Malloa",        marca:"Malloa",       cat:"Condimentos",porcion:50,  cal:30,  prot:1,   carbs:7,   grasas:0,   fibra:1,   emoji:"🫙"},
  {id:317,nombre:"Salsa de soya Kikkoman",        marca:"Kikkoman",     cat:"Condimentos",porcion:15,  cal:10,  prot:1,   carbs:1,   grasas:0,   fibra:0,   emoji:"🫙"},
  {id:318,nombre:"Vinagre de manzana",            marca:"Genérico",     cat:"Condimentos",porcion:15,  cal:3,   prot:0,   carbs:0.5, grasas:0,   fibra:0,   emoji:"🍶"},

  /* ── PREPARADOS / COMIDA RÁPIDA ── */
  {id:330,nombre:"Cheeseburger McDonald's",       marca:"McDonald's",   cat:"Comida rápida",porcion:119, cal:300, prot:15, carbs:32, grasas:12, fibra:2,  emoji:"🍔"},
  {id:331,nombre:"Big Mac McDonald's",            marca:"McDonald's",   cat:"Comida rápida",porcion:214, cal:550, prot:25, carbs:45, grasas:30, fibra:3,  emoji:"🍔"},
  {id:332,nombre:"McPollo McDonald's",            marca:"McDonald's",   cat:"Comida rápida",porcion:170, cal:400, prot:24, carbs:38, grasas:16, fibra:2,  emoji:"🍗"},
  {id:333,nombre:"Papas fritas McDonald's med.",  marca:"McDonald's",   cat:"Comida rápida",porcion:117, cal:320, prot:4,  carbs:44, grasas:15, fibra:3,  emoji:"🍟"},
  {id:334,nombre:"Completo Doggi's",              marca:"Doggi's",      cat:"Comida rápida",porcion:250, cal:490, prot:14, carbs:46, grasas:27, fibra:3,  emoji:"🌭"},
  {id:335,nombre:"Pizza Italiana porción",        marca:"Domino's",     cat:"Comida rápida",porcion:120, cal:270, prot:12, carbs:32, grasas:10, fibra:2,  emoji:"🍕"},
  {id:336,nombre:"Sushi roll 8 piezas",           marca:"Genérico",     cat:"Comida rápida",porcion:200, cal:300, prot:10, carbs:56, grasas:4,  fibra:2,  emoji:"🍱"},
  {id:337,nombre:"Shawarma de pollo",             marca:"Genérico",     cat:"Comida rápida",porcion:300, cal:520, prot:28, carbs:52, grasas:20, fibra:4,  emoji:"🫔"},
  {id:338,nombre:"Tacos de pollo (2 ud)",         marca:"Genérico",     cat:"Comida rápida",porcion:200, cal:380, prot:20, carbs:42, grasas:14, fibra:4,  emoji:"🌮"},

  /* ── LÁCTEOS ADICIONALES ── */
  {id:340,nombre:"Leche condensada Nestlé",       marca:"Nestlé",       cat:"Lácteos",      porcion:40,  cal:130, prot:3,  carbs:22, grasas:3.5,fibra:0,  emoji:"🥛"},
  {id:341,nombre:"Leche en polvo Nido",           marca:"Nestlé",       cat:"Lácteos",      porcion:26,  cal:115, prot:5,  carbs:14, grasas:4,  fibra:0,  emoji:"🥛"},
  {id:342,nombre:"Yogurt Activia Danone",         marca:"Danone",       cat:"Lácteos",      porcion:125, cal:90,  prot:4,  carbs:13, grasas:2.5,fibra:0,  emoji:"🥣"},
  {id:343,nombre:"Cheddar laminado",              marca:"Genérico",     cat:"Lácteos",      porcion:20,  cal:67,  prot:4,  carbs:0.5,grasas:5.5,fibra:0,  emoji:"🧀"},

  /* ── PANES ADICIONALES ── */
  {id:345,nombre:"Croissant mantequilla",         marca:"Artesanal",    cat:"Panes",        porcion:60,  cal:230, prot:5,  carbs:26, grasas:12, fibra:1,  emoji:"🥐"},
  {id:346,nombre:"Muffin inglés",                 marca:"Artesanal",    cat:"Panes",        porcion:55,  cal:130, prot:4.5,carbs:26, grasas:1,  fibra:1.5,emoji:"🫓"},
  {id:347,nombre:"Bagel natural",                 marca:"Artesanal",    cat:"Panes",        porcion:98,  cal:270, prot:10, carbs:52, grasas:1.5,fibra:2,  emoji:"🥯"},
  {id:348,nombre:"Tortilla de trigo grande",      marca:"Genérico",     cat:"Panes",        porcion:45,  cal:140, prot:4,  carbs:24, grasas:3,  fibra:1,  emoji:"🫓"},

  /* ── SNACKS ADICIONALES ── */
  {id:350,nombre:"Hummus con tostadas (porción)", marca:"Genérico",     cat:"Snacks",       porcion:80,  cal:180, prot:6,  carbs:20, grasas:8,  fibra:4,  emoji:"🥙"},
  {id:351,nombre:"Palomitas de maíz naturales",   marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:110, prot:3,  carbs:22, grasas:1.5,fibra:3,  emoji:"🍿"},
  {id:352,nombre:"Palomitas mantequilla",         marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:150, prot:2,  carbs:18, grasas:8,  fibra:2,  emoji:"🍿"},
  {id:353,nombre:"Chocolate blanco Nestlé",       marca:"Nestlé",       cat:"Snacks",       porcion:30,  cal:160, prot:2,  carbs:18, grasas:9,  fibra:0,  emoji:"🍫"},
  {id:354,nombre:"Marshmallows",                  marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:95,  prot:1,  carbs:23, grasas:0,  fibra:0,  emoji:"☁️"},
  {id:355,nombre:"Semillas de chía",              marca:"Genérico",     cat:"Snacks",       porcion:15,  cal:68,  prot:2.5,carbs:5,  grasas:4.5,fibra:5,  emoji:"🌱"},
  {id:356,nombre:"Semillas de girasol",           marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:175, prot:6,  carbs:6,  grasas:14, fibra:2,  emoji:"🌻"},

  /* ── BEBIDAS ADICIONALES ── */
  {id:360,nombre:"Jugo natural naranja casero",   marca:"Natural",      cat:"Bebidas",      porcion:250, cal:110, prot:1.5,carbs:26, grasas:0,  fibra:0.5,emoji:"🍊"},
  {id:361,nombre:"Batido proteico comercial",     marca:"Genérico",     cat:"Bebidas",      porcion:330, cal:160, prot:20, carbs:15, grasas:3,  fibra:2,  emoji:"🥤"},
  {id:362,nombre:"Leche con chocolate Soprole",   marca:"Soprole",      cat:"Bebidas",      porcion:250, cal:195, prot:8,  carbs:30, grasas:4.5,fibra:0,  emoji:"🍫"},
  {id:363,nombre:"Limonada natural (vaso)",       marca:"Natural",      cat:"Bebidas",      porcion:300, cal:80,  prot:0.5,carbs:22, grasas:0,  fibra:0,  emoji:"🍋"},
  {id:364,nombre:"Smoothie frutas natural",       marca:"Natural",      cat:"Bebidas",      porcion:300, cal:150, prot:2,  carbs:36, grasas:0.5,fibra:3,  emoji:"🥤"},
  {id:365,nombre:"Agua de coco natural",          marca:"Natural",      cat:"Bebidas",      porcion:300, cal:60,  prot:1,  carbs:15, grasas:0.5,fibra:0,  emoji:"🥥"},
  {id:366,nombre:"Cerveza sin alcohol",           marca:"Genérico",     cat:"Bebidas",      porcion:330, cal:70,  prot:0.5,carbs:12, grasas:0,  fibra:0,  emoji:"🍺"},

  /* ── SALSAS Y ADEREZOS ── */
  {id:370,nombre:"Aceite oliva + limón (vinagreta)",marca:"Natural",    cat:"Condimentos",  porcion:20,  cal:85,  prot:0,  carbs:1,  grasas:9,  fibra:0,  emoji:"🫙"},
  {id:371,nombre:"Salsa tzatziki",                marca:"Genérico",     cat:"Condimentos",  porcion:30,  cal:35,  prot:2,  carbs:3,  grasas:1.5,fibra:0,  emoji:"🫙"},
  {id:372,nombre:"Guacamole",                     marca:"Natural",      cat:"Condimentos",  porcion:60,  cal:95,  prot:1.5,carbs:5,  grasas:8.5,fibra:3.5,emoji:"🥑"},
  {id:373,nombre:"Tahini (pasta sésamo)",         marca:"Genérico",     cat:"Condimentos",  porcion:15,  cal:90,  prot:2.5,carbs:3,  grasas:8,  fibra:1,  emoji:"🫙"},
  {id:374,nombre:"Pesto",                         marca:"Genérico",     cat:"Condimentos",  porcion:30,  cal:120, prot:3,  carbs:2,  grasas:12, fibra:0.5,emoji:"🌿"},

  /* ── PROTEÍNAS / PREPARACIONES ── */
  {id:380,nombre:"Filete pollo a la plancha",     marca:"Natural",      cat:"Preparados",   porcion:150, cal:165, prot:34, carbs:0,  grasas:3,  fibra:0,  emoji:"🍗"},
  {id:381,nombre:"Salmón al horno",               marca:"Natural",      cat:"Preparados",   porcion:150, cal:300, prot:30, carbs:0,  grasas:20, fibra:0,  emoji:"🐟"},
  {id:382,nombre:"Huevos revueltos (2 huevos)",   marca:"Natural",      cat:"Preparados",   porcion:120, cal:180, prot:13, carbs:1,  grasas:14, fibra:0,  emoji:"🍳"},
  {id:383,nombre:"Omelette 3 huevos",             marca:"Natural",      cat:"Preparados",   porcion:180, cal:270, prot:20, carbs:1,  grasas:21, fibra:0,  emoji:"🍳"},
  {id:384,nombre:"Vacuno a la plancha",           marca:"Natural",      cat:"Preparados",   porcion:150, cal:260, prot:40, carbs:0,  grasas:11, fibra:0,  emoji:"🥩"},
  {id:385,nombre:"Arroz con leche (porción)",     marca:"Artesanal",    cat:"Preparados",   porcion:200, cal:240, prot:5,  carbs:42, grasas:6,  fibra:0.5,emoji:"🍚"},
  {id:386,nombre:"Ensalada César con pollo",      marca:"Natural",      cat:"Preparados",   porcion:300, cal:380, prot:28, carbs:18, grasas:22, fibra:4,  emoji:"🥗"},
  {id:387,nombre:"Ensalada mixta simple",         marca:"Natural",      cat:"Preparados",   porcion:200, cal:60,  prot:2,  carbs:10, grasas:1,  fibra:4,  emoji:"🥗"},
  {id:388,nombre:"Puré de papa con mantequilla",  marca:"Natural",      cat:"Preparados",   porcion:200, cal:240, prot:4,  carbs:36, grasas:9,  fibra:3,  emoji:"🥔"},
  {id:389,nombre:"Sopa de verduras casera",       marca:"Natural",      cat:"Preparados",   porcion:350, cal:120, prot:5,  carbs:22, grasas:2,  fibra:4,  emoji:"🍲"},

  /* ── SUPLEMENTOS ── */
  {id:320,nombre:"Whey protein Gold Standard",    marca:"ON",           cat:"Suplementos",porcion:31,  cal:120, prot:24,  carbs:3,   grasas:2,   fibra:0,   emoji:"💪"},
  {id:321,nombre:"Proteína vegana (guisante)",    marca:"Genérico",     cat:"Suplementos",porcion:30,  cal:110, prot:20,  carbs:5,   grasas:2.5, fibra:1,   emoji:"🌱"},
  {id:322,nombre:"Barra proteica Quest",          marca:"Quest",        cat:"Suplementos",porcion:60,  cal:190, prot:21,  carbs:22,  grasas:8,   fibra:14,  emoji:"🍫"},
  {id:323,nombre:"Creatina monohidratada",        marca:"Genérico",     cat:"Suplementos",porcion:5,   cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"⚗️"},
  {id:324,nombre:"BCAA polvo",                    marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:8,   carbs:0,   grasas:0,   fibra:0,   emoji:"💊"},
  {id:325,nombre:"Colágeno hidrolizado",          marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:9,   carbs:0,   grasas:0,   fibra:0,   emoji:"✨"},
];


/* ═══════════════════════════════════════════════════════
   EJERCICIOS — MET values para cálculo de calorías quemadas
   Fórmula: MET × peso_kg × (minutos/60)
═══════════════════════════════════════════════════════ */
const EXERCISES = [
  {id:'walk',     nombre:'Caminar',        emoji:'🚶', met:3.5,  cat:'Cardio'},
  {id:'walkf',    nombre:'Caminar rápido', emoji:'🏃', met:5.0,  cat:'Cardio'},
  {id:'run',      nombre:'Correr',         emoji:'🏃', met:9.8,  cat:'Cardio'},
  {id:'run_slow', nombre:'Trote suave',    emoji:'🏃', met:6.0,  cat:'Cardio'},
  {id:'bike',     nombre:'Bicicleta',      emoji:'🚴', met:7.5,  cat:'Cardio'},
  {id:'swim',     nombre:'Natación',       emoji:'🏊', met:8.0,  cat:'Cardio'},
  {id:'hiit',     nombre:'HIIT',           emoji:'⚡', met:12.0, cat:'Cardio'},
  {id:'elliptic', nombre:'Elíptico',       emoji:'🔄', met:5.0,  cat:'Cardio'},
  {id:'jump',     nombre:'Saltar cuerda',  emoji:'🪢', met:11.0, cat:'Cardio'},
  {id:'stair',    nombre:'Escaleras',      emoji:'🪜', met:8.0,  cat:'Cardio'},
  {id:'weights',  nombre:'Pesas',          emoji:'🏋️', met:5.0,  cat:'Fuerza'},
  {id:'crossfit', nombre:'CrossFit',       emoji:'💪', met:9.5,  cat:'Fuerza'},
  {id:'box',      nombre:'Boxeo',          emoji:'🥊', met:9.8,  cat:'Fuerza'},
  {id:'calistenia',nombre:'Calistenia',    emoji:'🤼', met:6.0,  cat:'Fuerza'},
  {id:'yoga',     nombre:'Yoga',           emoji:'🧘', met:3.0,  cat:'Flexib.'},
  {id:'pilates',  nombre:'Pilates',        emoji:'🤸', met:3.5,  cat:'Flexib.'},
  {id:'stretch',  nombre:'Estiramiento',   emoji:'🤸', met:2.5,  cat:'Flexib.'},
  {id:'football', nombre:'Fútbol',         emoji:'⚽', met:8.0,  cat:'Deportes'},
  {id:'basket',   nombre:'Básquetbol',     emoji:'🏀', met:7.5,  cat:'Deportes'},
  {id:'tennis',   nombre:'Tenis',          emoji:'🎾', met:7.3,  cat:'Deportes'},
  {id:'dance',    nombre:'Baile',          emoji:'💃', met:5.5,  cat:'Deportes'},
  {id:'hike',     nombre:'Senderismo',     emoji:'🥾', met:6.0,  cat:'Deportes'},
  {id:'climb',    nombre:'Escalada',       emoji:'🧗', met:8.9,  cat:'Deportes'},
  {id:'paddle',   nombre:'Pádel',          emoji:'🏸', met:6.5,  cat:'Deportes'},
];


/* ═══════════════════════════════════════════════════════
   SUGERENCIAS DE ALIMENTOS POR OBJETIVO
═══════════════════════════════════════════════════════ */
const SUGGESTIONS = {
  bajar: {
    label: 'Para bajar de peso',
    tip: 'Alta proteína, baja densidad calórica',
    color: '#FF3B30',
    groups: [
      { title: '💪 Proteínas magras', ids: [40,42,55,104,105,265,109] },
      { title: '🥦 Verduras saciantes', ids: [208,202,201,210,211,84,91] },
      { title: '🍓 Frutas bajas en calorías', ids: [184,192,193,75,188] },
      { title: '🫘 Legumbres (fibra+prot)', ids: [225,226,229,95] },
    ],
  },
  mantener: {
    label: 'Para mantenimiento',
    tip: 'Balance perfecto de macros',
    color: '#007AFF',
    groups: [
      { title: '🌾 Carbos de calidad', ids: [100,241,236,238,101] },
      { title: '🍗 Proteínas variadas', ids: [40,103,108,20,55] },
      { title: '🥑 Grasas saludables', ids: [74,59,270,132,133] },
      { title: '🥛 Lácteos equilibrados', ids: [15,18,10,23] },
    ],
  },
  recomp: {
    label: 'Para recomposición',
    tip: 'Máxima proteína, carbos estratégicos',
    color: '#AF52DE',
    groups: [
      { title: '🥇 Top proteínas', ids: [40,42,103,265,109,320,105] },
      { title: '⚡ Carbos post-entreno', ids: [76,235,241,86,203] },
      { title: '🥚 Superalimentos', ids: [108,74,59,270,91] },
      { title: '💊 Suplementos clave', ids: [320,323,324,133] },
    ],
  },
  subir: {
    label: 'Para ganar masa',
    tip: 'Calórico, proteico y consistente',
    color: '#34C759',
    groups: [
      { title: '🔥 Alta densidad calórica', ids: [76,235,97,86,47,103] },
      { title: '🥛 Lácteos calóricos', ids: [1,28,13,362,131] },
      { title: '🥜 Frutos secos y grasas', ids: [58,59,133,74,272] },
      { title: '🍝 Carbos abundantes', ids: [237,97,203,100,103] },
    ],
  },
};

/* Sugerencias de comida según hora del día */
const TIME_SUGGESTIONS = {
  desayuno: { ids:[100,108,1,42,75,76,47,4,18], label:'Para el desayuno' },
  almuerzo: { ids:[40,235,208,74,103,95,241,20,45], label:'Para el almuerzo' },
  once:     { ids:[37,82,10,4,71,138,29,75], label:'Para la once' },
  cena:     { ids:[104,202,108,241,95,180,265,91], label:'Para la cena' },
  snack:    { ids:[59,74,132,184,265,192,51,133], label:'Para el snack' },
};


/* ═══════════════════════════════════════════════════════
   TIPS NUTRICIONALES DINÁMICOS
═══════════════════════════════════════════════════════ */
const getTips = ({tot, metas, obj, agua, pct, exercises, streak}) => {
  const tips = [];
  const protPct  = metas.prot  > 0 ? tot.prot  / metas.prot  : 0;
  const carbsPct = metas.carbs > 0 ? tot.carbs / metas.carbs : 0;
  const grasasPct= metas.grasas> 0 ? tot.grasas/ metas.grasas: 0;
  const hr       = new Date().getHours();

  /* Calorías */
  if(pct === 0 && hr >= 9)
    tips.push({icon:'🌅', text:'¡Empieza registrando tu desayuno!', color:'#FF9500', key:'start'});
  if(pct > 0 && pct < 0.4 && hr >= 14)
    tips.push({icon:'⚡', text:'Llevas pocas calorías. Recuerda comer bien para tener energía.', color:'#FF9500', key:'low'});
  if(pct > 1.15)
    tips.push({icon:'⚠️', text:'Superaste tu meta calórica. Termina el día con algo liviano.', color:'#FF3B30', key:'over'});
  if(pct >= 0.9 && pct <= 1.05)
    tips.push({icon:'🎯', text:'¡Perfecto! Estás justo en tu meta calórica.', color:'#34C759', key:'perfect'});

  /* Proteínas */
  if(protPct < 0.5 && pct > 0.3)
    tips.push({icon:'🥩', text:`Solo llevas ${Math.round(tot.prot)}g de proteína. Agrega pollo, huevos o atún.`, color:'#FF3B30', key:'prot'});
  if(protPct > 1.1)
    tips.push({icon:'💪', text:'¡Excelente ingesta proteica hoy!', color:'#34C759', key:'protgood'});

  /* Agua */
  if(agua < 4 && hr >= 15)
    tips.push({icon:'💧', text:`Solo ${agua} vasos de agua. Tomar más mejora el metabolismo.`, color:'#007AFF', key:'water'});
  if(agua >= 8)
    tips.push({icon:'💧', text:'¡Hidratación perfecta! Tu cuerpo te lo agradece.', color:'#007AFF', key:'watergood'});

  /* Ejercicio */
  if(exercises.length === 0 && hr >= 18 && (obj === 'bajar' || obj === 'recomp'))
    tips.push({icon:'🏃', text:'No has registrado ejercicio hoy. ¡Aunque sea una caminata cuenta!', color:'#34C759', key:'ex'});
  if(exercises.length > 0)
    tips.push({icon:'🔥', text:`Quemaste ${exercises.reduce((s,e)=>s+e.burn,0)} kcal con ejercicio. ¡Sigue así!`, color:'#FF9500', key:'exgood'});

  /* Racha */
  if(streak.days >= 7)
    tips.push({icon:'🏆', text:`¡${streak.days} días seguidos! Eres constante, eso es lo más importante.`, color:'#FFD60A', key:'streak'});
  if(streak.days >= 3 && streak.days < 7)
    tips.push({icon:'🔥', text:`${streak.days} días seguidos. ¡Vas camino a una semana completa!`, color:'#FF9500', key:'streak3'});

  /* Objetivo específico */
  if(obj === 'bajar' && carbsPct > 0.9 && protPct < 0.6)
    tips.push({icon:'📊', text:'Para bajar peso: menos carbos, más proteína en cada comida.', color:'#FF3B30', key:'obj'});
  if(obj === 'subir' && pct < 0.8 && hr >= 20)
    tips.push({icon:'📈', text:'Para ganar masa necesitas el superávit. ¡Faltan calorías!', color:'#34C759', key:'obj2'});

  /* Hora del día */
  if(hr >= 20 && pct < 0.6)
    tips.push({icon:'🌙', text:'Son las 8pm y llevas pocas calorías. No te vayas a dormir con hambre.', color:'#AF52DE', key:'night'});

  /* Fibra */
  if(tot.fibra < 10 && pct > 0.5)
    tips.push({icon:'🥦', text:'Poca fibra hoy. Agrega verduras o legumbres para mejorar la digestión.', color:'#34C759', key:'fiber'});

  return tips.slice(0, 3); // max 3 tips
};

const DIETAS = [
  {id:"perf",icon:"🔥",nombre:"Pérdida de Grasa",color:"#B85A3C",
   desc:"Déficit moderado, alta proteína. Pierdes grasa sin perder músculo.",
   cals:"TDEE − 500 kcal",macros:"35% prot / 30% carbs / 35% grasas",
   reglas:["Déficit de ~500 kcal diarias","Proteína 1.8–2.2g por kg de peso","Come proteínas en cada comida","Carbohidratos mayormente post-entreno","Sin bebidas azucaradas ni snacks procesados"],
   menu:[{t:"Desayuno",d:"Avena Quaker + Leche descremada + Frutillas"},{t:"Snack",d:"Yogurt Soprole 0% + 10 almendras"},{t:"Almuerzo",d:"Pechuga pollo (200g) + Arroz integral + Brócoli"},{t:"Once",d:"2 tostadas Harry's integral + Jamón pavo + Té"},{t:"Cena",d:"Merluza al horno (200g) + Espinaca + Tomate"}]},
  {id:"mant",icon:"⚖️",nombre:"Mantenimiento",color:"#4A7BA8",
   desc:"Come igual a lo que gastas. Dieta balanceada y variada.",
   cals:"= TDEE",macros:"25% prot / 45% carbs / 30% grasas",
   reglas:["Calorías = tu TDEE exacto","Balance entre los 3 macros","Incluye todos los grupos de alimentos","Prioriza alimentos integrales","2–3 litros de agua al día"],
   menu:[{t:"Desayuno",d:"2 tostadas + 2 huevos revueltos + Café"},{t:"Snack",d:"Fruta de temporada + Yogurt Colun"},{t:"Almuerzo",d:"Cazuela de vacuno + arroz + ensalada"},{t:"Once",d:"Marraqueta + Queso chanco + Té"},{t:"Cena",d:"Pasta Carozzi + Atún Salmonte + Tomate"}]},
  {id:"recomp",icon:"💪",nombre:"Recomposición Corporal",color:"#7050A8",
   desc:"Come al TDEE con altísima proteína. Pierdes grasa y ganas músculo.",
   cals:"= TDEE",macros:"40% prot / 35% carbs / 25% grasas",
   reglas:["Calorías = TDEE","Proteína muy alta: 2.2–2.5g/kg","Carbohidratos alrededor del entrenamiento","Grasas saludables: palta, aceite oliva, nueces","Entrenamiento de fuerza 3–5 veces/semana obligatorio"],
   menu:[{t:"Desayuno",d:"4 claras + 2 huevos + Avena (30g) + Frutillas"},{t:"Pre-entreno",d:"Plátano + Whey protein (30g)"},{t:"Almuerzo",d:"Pechuga (250g) + Arroz integral (150g) + Palta"},{t:"Once",d:"Yogurt griego Danone + Almendras + Manzana"},{t:"Cena",d:"Salmón (200g) + Quinoa + Espinaca + Brócoli"}]},
  {id:"volum",icon:"📈",nombre:"Ganancia de Masa Muscular",color:"#2E7A4A",
   desc:"Superávit moderado para construir músculo limpio y fuerte.",
   cals:"TDEE + 300 kcal",macros:"25% prot / 50% carbs / 25% grasas",
   reglas:["Superávit de +250–350 kcal","Alta proteína y carbohidratos","Come cada 3–4 horas","Desayuno abundante","Post-entreno: proteína + carbohidratos rápidos"],
   menu:[{t:"Desayuno",d:"Avena (80g) + Leche entera + 2 huevos + Plátano"},{t:"Snack",d:"Marraqueta + Mantequilla + Manjar Colun"},{t:"Almuerzo",d:"Lomo vacuno (200g) + Arroz blanco (200g) + Choclo"},{t:"Post-entreno",d:"Whey protein + Plátano + Granola Quaker"},{t:"Cena",d:"Pollo (200g) + Pasta Carozzi (150g) + Salsa tomate"}]},
  {id:"lowcarb",icon:"🥑",nombre:"Low Carb Chilena",color:"#A07030",
   desc:"Baja en carbohidratos, rica en grasas saludables.",
   cals:"= TDEE",macros:"30% prot / 15% carbs / 55% grasas",
   reglas:["Máximo 80–100g de carbohidratos/día","Sin pan, arroz, pasta ni azúcar","Base: palta, queso, huevo, carnes","Solo frutas bajas en azúcar: frutillas, kiwi","Aceite de oliva y frutos secos como fuente de grasa"],
   menu:[{t:"Desayuno",d:"3 huevos con queso gauda + Palta + Café negro"},{t:"Snack",d:"Queso gauda Colun (60g) + Almendras (30g)"},{t:"Almuerzo",d:"Salmón al horno (200g) + Espinaca + Palta + Aceite oliva"},{t:"Once",d:"Galletas Tostadas (2) + Queso crema + Jamón serrano + Té"},{t:"Cena",d:"Filete de vacuno (200g) + Ensalada hojas verdes + Aceite oliva"}]},
];

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const CATS = ["Todas","Lácteos","Carnes","Cecinas","Panes","Cereales","Snacks","Bebidas","Frutas","Verduras","Legumbres","Granos","Pescados","Huevos","Comidas CL","Congelados","Comida rápida","Preparados","Aceites","Condimentos","Suplementos","Mis alimentos","Mis recetas","Escaneado"];
const MEALS = ["Desayuno","Almuerzo","Once","Cena","Snack"];
const MC = {Desayuno:"#FF9500",Almuerzo:"#FF3B30",Once:"#AF52DE",Cena:"#007AFF",Snack:"#34C759"};
const MI = {Desayuno:"🌅",Almuerzo:"☀️",Once:"☕",Cena:"🌙",Snack:"🍎"};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const calcTDEE = ({peso,altura,edad,sexo,act}) => {
  const bmr = sexo==="M"?10*peso+6.25*altura-5*edad+5:10*peso+6.25*altura-5*edad-161;
  return Math.round(bmr*parseFloat(act));
};
const calcMetas = (tdee,obj) => {
  const O={bajar:{d:-500,p:.35,c:.30,g:.35},mantener:{d:0,p:.25,c:.45,g:.30},recomp:{d:0,p:.40,c:.35,g:.25},subir:{d:300,p:.25,c:.50,g:.25}};
  const {d,p,c,g}=O[obj]||O.mantener;
  const cal=Math.max(1200,tdee+d);
  return {cal,prot:Math.round(cal*p/4),carbs:Math.round(cal*c/4),grasas:Math.round(cal*g/9)};
};
const itemRatio = (i) => i.grams && i.porcion ? i.grams / i.porcion : 1;
const sumLog = (log) => (log||[]).reduce((a,i)=>{
  if(!i||typeof i.cal==='undefined') return a;
  const r=i.grams&&i.porcion?i.grams/i.porcion:1;
  const q=i.qty||1;
  return {
    cal:a.cal+(i.cal||0)*r*q,
    prot:a.prot+(i.prot||0)*r*q,
    carbs:a.carbs+(i.carbs||0)*r*q,
    grasas:a.grasas+(i.grasas||0)*r*q,
    fibra:a.fibra+(i.fibra||0)*r*q,
  };
},{cal:0,prot:0,carbs:0,grasas:0,fibra:0});
const todayKey = () => new Date().toISOString().slice(0,10);
const F = "'Sora','Nunito',sans-serif";

/* ═══════════════════════════════════════════════════════
   LOCALSTORAGE
═══════════════════════════════════════════════════════ */
const LS = {
  get:(k,d)=>{try{const v=localStorage.getItem('caloru_'+k);return v!=null?JSON.parse(v):d;}catch{return d;}},
  set:(k,v)=>{try{localStorage.setItem('caloru_'+k,JSON.stringify(v));}catch{}},
};

/* ═══════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════ */
const LIGHT = {
  bg:'#F2F2F7', surface:'#FFFFFF', surfaceAlt:'#F2F2F7', border:'#E5E5EA',
  primary:'#1C1C1E', primaryMid:'#3A3A3C', primaryLight:'#636366', glow:'#34C759',
  accent:'#34C759', accentLight:'#30D158', gold:'#FF9500',
  text:'#000000', textSec:'#6D6D72', textMuted:'#C7C7CC',
  navBg:'rgba(255,255,255,0.94)', headerBg:'#FFFFFF',
  red:'#FF3B30', blue:'#007AFF', purple:'#AF52DE', green:'#34C759', amber:'#FF9500',
  card:'#FFFFFF', cardAlt:'#F2F2F7',
};
const DARK = {
  bg:'#000000', surface:'#1C1C1E', surfaceAlt:'#2C2C2E', border:'#38383A',
  primary:'#FFFFFF', primaryMid:'#EBEBF5', primaryLight:'#AEAEB2', glow:'#30D158',
  accent:'#30D158', accentLight:'#34C759', gold:'#FF9F0A',
  text:'#FFFFFF', textSec:'#8E8E93', textMuted:'#48484A',
  navBg:'rgba(0,0,0,0.94)', headerBg:'#000000',
  red:'#FF453A', blue:'#0A84FF', purple:'#BF5AF2', green:'#30D158', amber:'#FF9F0A',
  card:'#1C1C1E', cardAlt:'#2C2C2E',
};

/* ═══════════════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════════════ */
function Logo({size=40}) {
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" fill="none">
      <rect width="130" height="130" rx="30" fill="white" stroke="#DDD4C8" strokeWidth="2"/>
      <ellipse cx="65" cy="94" rx="33" ry="6" fill="#EDE0D0"/>
      <circle cx="65" cy="78" r="32" fill="#F9F4EF" stroke="#DDD4C8" strokeWidth="2"/>
      <circle cx="65" cy="78" r="24" fill="white" stroke="#EBE3D9" strokeWidth="1.5"/>
      <ellipse cx="57" cy="83" rx="9" ry="5" fill="#F5EDD8"/>
      <circle cx="52" cy="82" r="2" fill="#EDE0C0"/><circle cx="55" cy="85" r="2" fill="#F0E8CE"/>
      <circle cx="58" cy="83" r="2" fill="#EDE0C0"/><circle cx="61" cy="85" r="2" fill="#F0E8CE"/>
      <circle cx="54" cy="80" r="1.8" fill="#F5EDD8"/><circle cx="57" cy="87" r="1.8" fill="#EDE0C0"/>
      <circle cx="60" cy="81" r="1.8" fill="#F5EDD8"/><circle cx="63" cy="84" r="1.8" fill="#EDE0C0"/>
      <ellipse cx="57" cy="72" rx="12" ry="9.5" fill="#C8845A"/>
      <ellipse cx="57" cy="72" rx="8.5" ry="6.5" fill="#DFA878"/>
      <ellipse cx="57" cy="72" rx="4.5" ry="3" fill="#C8845A"/>
      <line x1="57" y1="63" x2="57" y2="58" stroke="#D0D0D0" strokeWidth="3.5" strokeLinecap="round"/>
      <ellipse cx="57" cy="57" rx="4" ry="2.5" fill="#E8E8E8"/>
      <line x1="76" y1="86" x2="76" y2="79" stroke="#1E5C34" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="76" cy="75" r="6.5" fill="#2E7A48"/><circle cx="70" cy="78" r="5" fill="#2E7A48"/>
      <circle cx="82" cy="78" r="5" fill="#2E7A48"/><circle cx="76" cy="70" r="3.5" fill="#4EA870"/>
      <circle cx="70" cy="76" r="2.5" fill="#4EA870"/><circle cx="82" cy="76" r="2.5" fill="#4EA870"/>
      <ellipse cx="65" cy="87" rx="6.5" ry="3.5" fill="#E07B4A" transform="rotate(-20 65 87)"/>
      <path d="M61 82 Q62.5 79 64 80.5" stroke="#3D8A59" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="27" y1="52" x2="27" y2="92" stroke="#2B3D35" strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="52" x2="22" y2="64" stroke="#2B3D35" strokeWidth="2" strokeLinecap="round"/>
      <line x1="27" y1="52" x2="27" y2="64" stroke="#2B3D35" strokeWidth="2" strokeLinecap="round"/>
      <line x1="32" y1="52" x2="32" y2="64" stroke="#2B3D35" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 64 Q27 68 32 64" fill="none" stroke="#2B3D35" strokeWidth="2"/>
      <line x1="103" y1="52" x2="103" y2="92" stroke="#2B3D35" strokeWidth="3" strokeLinecap="round"/>
      <path d="M103 52 Q111 60 103 68" fill="#2B3D35"/>
      <text x="65" y="28" textAnchor="middle" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fill="#2B3D35">Calorú</text>
    </svg>
  );
}


/* ═══════════════════════════════════════════════════════
   HAPTIC FEEDBACK — vibración en interacciones clave
═══════════════════════════════════════════════════════ */
const haptic = (type='light') => {
  try {
    const patterns = {
      light:[8], medium:[15], heavy:[25],
      success:[10,50,10], error:[20,30,20,30,20],
      add:[8], goal:[15,30,15],
    };
    navigator.vibrate(patterns[type]||patterns.light);
  } catch {}
};

/* ═══════════════════════════════════════════════════════
   CONFETTI — celebración al cumplir meta calórica
═══════════════════════════════════════════════════════ */
function Confetti({active}) {
  if(!active) return null;
  const colors=['#34C759','#007AFF','#FF9500','#FF3B30','#AF52DE','#FFD60A','#FF6B6B','#4ECDC4'];
  const particles = Array.from({length:55},(_,i)=>({
    id:i,
    color:colors[i%colors.length],
    left:Math.random()*100,
    delay:Math.random()*0.8,
    dur:1.8+Math.random()*1.2,
    size:5+Math.random()*7,
    rotate:Math.random()*360,
    shape:i%3===0?'circle':i%3===1?'rect':'triangle',
  }));
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,pointerEvents:'none',overflow:'hidden'}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:'absolute',
          left:`${p.left}%`,top:'-10px',
          width:p.size,height:p.size,
          background:p.shape==='triangle'?'transparent':p.color,
          borderRadius:p.shape==='circle'?'50%':p.shape==='rect'?'2px':'0',
          borderLeft:p.shape==='triangle'?`${p.size/2}px solid transparent`:'none',
          borderRight:p.shape==='triangle'?`${p.size/2}px solid transparent`:'none',
          borderBottom:p.shape==='triangle'?`${p.size}px solid ${p.color}`:'none',
          animation:`confettiDrop ${p.dur}s ease-in ${p.delay}s both`,
          transform:`rotate(${p.rotate}deg)`,
        }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SPLASH SCREEN
═══════════════════════════════════════════════════════ */
function Splash({onDone}) {
  const [phase,setPhase] = useState(0); // 0=intro 1=content 2=bar 3=exit
  const [barW,setBarW]   = useState(0);

  useEffect(()=>{
    const t0=setTimeout(()=>setPhase(1), 100);
    const t1=setTimeout(()=>setPhase(2), 700);
    const t2=setTimeout(()=>setBarW(100), 800);
    const t3=setTimeout(()=>setPhase(3), 1900);
    const t4=setTimeout(()=>onDone(), 2300);
    return ()=>[t0,t1,t2,t3,t4].forEach(clearTimeout);
  },[]);

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:100,
      background:'linear-gradient(160deg,#1A2C22 0%,#0D1710 60%,#1A2215 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      overflow:'hidden',
      opacity:phase===3?0:1,
      transform:phase===3?'scale(1.04)':'scale(1)',
      transition:phase===3?'opacity .4s ease,transform .4s ease':'none',
    }}>

      {/* Background grid dots */}
      <div style={{position:'absolute',inset:0,opacity:.06,backgroundImage:'radial-gradient(circle,#fff 1px,transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}}/>

      {/* Pulsing rings */}
      {phase>=1&&[0,1,2].map(i=>(
        <div key={i} style={{
          position:'absolute',
          width:200+i*120,height:200+i*120,
          borderRadius:'50%',
          border:'1.5px solid rgba(110,204,138,0.15)',
          animation:`splashRingOut ${1.8+i*.4}s ease-out ${i*.2}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* Logo with spring animation */}
      <div style={{
        marginBottom:24,
        animation:phase>=1?'splashLogoIn .7s cubic-bezier(.34,1.56,.64,1) both':'none',
        filter:phase>=1?'drop-shadow(0 0 30px rgba(110,204,138,0.4))':'none',
      }}>
        <Logo size={96}/>
      </div>

      {/* Text */}
      <div style={{
        textAlign:'center',marginBottom:40,
        animation:phase>=1?'splashTextIn .5s ease .3s both':'none',
      }}>
        <div style={{
          color:'white',fontSize:38,fontWeight:800,
          fontFamily:F,letterSpacing:'-1.5px',lineHeight:1,
        }}>Calorú</div>
        <div style={{
          color:'rgba(255,255,255,0.4)',fontSize:15,
          fontFamily:F,fontWeight:400,marginTop:8,letterSpacing:'.5px',
        }}>Tu nutrición, a tu ritmo</div>
      </div>

      {/* Loading bar */}
      {phase>=2&&(
        <div style={{
          width:180,height:3,
          background:'rgba(255,255,255,0.1)',
          borderRadius:3,overflow:'hidden',
        }}>
          <div style={{
            height:'100%',borderRadius:3,
            background:'linear-gradient(90deg,#34C759,#6ECC8A)',
            width:`${barW}%`,
            transition:'width 1.1s cubic-bezier(.25,.46,.45,.94)',
            boxShadow:'0 0 8px rgba(52,199,89,0.6)',
          }}/>
        </div>
      )}

      {/* Green accent dot */}
      <div style={{
        position:'absolute',bottom:60,
        display:'flex',gap:7,
        animation:phase>=1?'splashTextIn .4s ease .5s both':'none',
      }}>
        {['#34C759','rgba(255,255,255,0.2)','rgba(255,255,255,0.2)'].map((bg,i)=>(
          <div key={i} style={{width:i===0?20:6,height:6,borderRadius:3,background:bg,transition:'all .3s'}}/>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════════════════════ */
function Onboarding({onDone}) {
  const [step,setStep]=useState(0);
  const [nombre,setNombre]=useState('');
  const [perfil,setPerfil]=useState({peso:70,altura:170,edad:25,sexo:'M',act:'1.55'});
  const [obj,setObj]=useState('mantener');
  const C=LIGHT;

  const steps=[
    // Step 0: Bienvenida + nombre
    <div key={0} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 28px',gap:24,textAlign:'center'}}>
      <Logo size={80}/>
      <div>
        <div style={{fontSize:28,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-1px',lineHeight:1.2}}>Bienvenido a Calorú</div>
        <div style={{fontSize:15,color:C.textSec,fontFamily:F,fontWeight:500,marginTop:8,lineHeight:1.5}}>Tu app de nutrición con productos chilenos reales. ¿Cómo te llamas?</div>
      </div>
      <input value={nombre} onChange={e=>setNombre(e.target.value)}
        placeholder="Tu nombre..."
        style={{
          width:'100%',padding:'16px 20px',borderRadius:18,
          border:`2px solid ${nombre?C.primary:C.border}`,
          fontSize:18,fontFamily:F,fontWeight:700,color:C.text,
          background:C.surfaceAlt,outline:'none',textAlign:'center',
          transition:'border-color .2s',
        }}/>
      <button onClick={()=>nombre.trim()&&setStep(1)} style={{
        width:'100%',padding:'16px',borderRadius:18,border:'none',
        background:nombre.trim()?'#1C1C1E':'#C7C7CC',color:'white',
        fontSize:16,fontWeight:800,fontFamily:F,cursor:nombre.trim()?'pointer':'default',
        transition:'background .2s',
      }}>Continuar →</button>
    </div>,

    // Step 1: Perfil físico
    <div key={1} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-.5px'}}>Tu perfil, {nombre} 💪</div>
        <div style={{fontSize:13,color:C.textSec,fontFamily:F,fontWeight:500,marginTop:4}}>Necesitamos esto para calcular tus calorías exactas</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[{l:'Peso (kg)',k:'peso'},{l:'Altura (cm)',k:'altura'},{l:'Edad',k:'edad'}].map(({l,k})=>(
          <div key={k} style={k==='edad'?{gridColumn:'1/-1'}:{}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:F}}>{l}</div>
            <input type="number" value={perfil[k]} onChange={e=>setPerfil({...perfil,[k]:+e.target.value})}
              style={{width:'100%',padding:'13px 16px',border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:20,fontWeight:800,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F}}/>
          </div>
        ))}
      </div>
      <div>
        <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:8,fontFamily:F}}>Sexo</div>
        <div style={{display:'flex',gap:8}}>
          {[{v:'M',l:'♂ Hombre'},{v:'F',l:'♀ Mujer'}].map(({v,l})=>(
            <button key={v} onClick={()=>setPerfil({...perfil,sexo:v})} style={{
              flex:1,padding:'13px',borderRadius:14,border:'none',
              background:perfil.sexo===v?'#1C1C1E':C.surfaceAlt,
              color:perfil.sexo===v?'#FFFFFF':C.textSec,
              fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .15s',
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:8,fontFamily:F}}>Actividad física</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[{v:'1.2',l:'🛋️ Sedentario'},{v:'1.375',l:'🚶 Ligero (1–2 días/sem)'},{v:'1.55',l:'🏃 Moderado (3–5 días/sem)'},{v:'1.725',l:'💪 Activo (6–7 días/sem)'},{v:'1.9',l:'🔥 Muy activo'}].map(({v,l})=>(
            <button key={v} onClick={()=>setPerfil({...perfil,act:v})} style={{
              padding:'12px 16px',borderRadius:13,textAlign:'left',
              border:`1.5px solid ${perfil.act===v?C.primary:C.border}`,
              background:perfil.act===v?`${C.primary}12`:C.surfaceAlt,
              color:perfil.act===v?C.primary:C.textSec,
              fontSize:13,fontWeight:perfil.act===v?700:500,cursor:'pointer',fontFamily:F,transition:'all .15s',
            }}>{l}</button>
          ))}
        </div>
      </div>
      <button onClick={()=>setStep(2)} style={{padding:'16px',borderRadius:18,border:'none',background:'#1C1C1E',color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer'}}>Continuar →</button>
    </div>,

    // Step 2: Objetivo
    <div key={2} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-.5px'}}>¿Cuál es tu objetivo?</div>
        <div style={{fontSize:13,color:C.textSec,fontFamily:F,fontWeight:500,marginTop:4}}>Ajustaremos tus metas diarias según esto</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[
          {k:'bajar',icon:'🔥',l:'Bajar de peso',sub:'Déficit calórico moderado',c:C.red},
          {k:'mantener',icon:'⚖️',l:'Mantener peso',sub:'Come lo que gastas',c:C.blue},
          {k:'recomp',icon:'💪',l:'Recomposición',sub:'Menos grasa, más músculo',c:C.purple},
          {k:'subir',icon:'📈',l:'Ganar masa muscular',sub:'Superávit moderado',c:C.green},
        ].map(({k,icon,l,sub,c})=>(
          <button key={k} onClick={()=>setObj(k)} style={{
            padding:'16px',borderRadius:18,textAlign:'left',
            border:`2px solid ${obj===k?c:C.border}`,
            background:obj===k?`${c}14`:C.surfaceAlt,
            cursor:'pointer',fontFamily:F,transition:'all .2s',
            display:'flex',alignItems:'center',gap:14,
          }}>
            <div style={{width:48,height:48,borderRadius:14,background:obj===k?`${c}22`:`${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{icon}</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:obj===k?c:C.text}}>{l}</div>
              <div style={{fontSize:12,color:C.textSec,fontWeight:500,marginTop:2}}>{sub}</div>
            </div>
            {obj===k&&<div style={{marginLeft:'auto',color:c,fontSize:20}}>✓</div>}
          </button>
        ))}
      </div>
      <div style={{background:'#007AFF14',borderRadius:16,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,color:C.textSec,fontFamily:F,fontWeight:500}}>Tu meta calórica estimada</div>
        <div style={{fontSize:22,fontWeight:800,color:'#007AFF',fontFamily:F}}>{calcMetas(calcTDEE(perfil),obj).cal} kcal</div>
      </div>
      <button onClick={()=>onDone({nombre:nombre.trim(),perfil,obj})} style={{
        padding:'16px',borderRadius:18,border:'none',
        background:'#1C1C1E',
        color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
      }}>¡Comenzar! 🎉</button>
    </div>,
  ];

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:F,overflowY:'auto'}}>
      {/* Progress bar */}
      <div style={{height:3,background:C.border}}>
        <div style={{height:'100%',width:`${(step+1)/3*100}%`,background:'#1C1C1E',transition:'width .4s ease'}}/>
      </div>
      {step>0&&(
        <button onClick={()=>setStep(step-1)} style={{margin:'12px 16px 0',background:'none',border:'none',color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',gap:4}}>
          ← Atrás
        </button>
      )}
      <div key={step} style={{animation:'slideInRight .3s cubic-bezier(.25,.46,.45,.94) both'}}>
        {steps[step]}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════ */
function DonutChart({prot,carbs,grasas,total,size=160,C2}) {
  const col = C2 || {border:'#E5E5EA',textMuted:'#C7C7CC',text:'#000000',red:'#FF3B30',amber:'#FF9500',purple:'#AF52DE'};
  if(total===0) return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx={80} cy={80} r={54} fill="none" stroke={col.border} strokeWidth={18}/>
      <text x={80} y={85} textAnchor="middle" fontSize={13} fontWeight={600} fill={col.textMuted} fontFamily={F}>Sin datos</text>
    </svg>
  );
  const r=54, circ=2*Math.PI*r;
  const macroTotal=(prot*4)+(carbs*4)+(grasas*9);
  const pProt=macroTotal>0?(prot*4/macroTotal):0;
  const pCarbs=macroTotal>0?(carbs*4/macroTotal):0;
  const pGrasas=macroTotal>0?(grasas*9/macroTotal):0;
  let off=0;
  const segs=[
    {p:pProt, c:col.red||'#FF3B30', label:'Prot'},
    {p:pCarbs, c:col.amber||'#FF9500', label:'Carbs'},
    {p:pGrasas,c:col.purple||'#AF52DE', label:'Grasas'},
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx={80} cy={80} r={r} fill="none" stroke={col.border} strokeWidth={18}/>
      {segs.map(({p,c},i)=>{
        const dash=p*circ, gap=circ-dash;
        const el=(
          <circle key={i} cx={80} cy={80} r={r} fill="none" stroke={c} strokeWidth={18}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-off*circ+circ/4}
            strokeLinecap="butt"/>
        );
        off+=p;
        return el;
      })}
      <text x={80} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={col.textMuted} fontFamily={F}>Total</text>
      <text x={80} y={90} textAnchor="middle" fontSize={22} fontWeight={800} fill={col.text} fontFamily={F}>{Math.round(total)}</text>
      <text x={80} y={105} textAnchor="middle" fontSize={11} fontWeight={500} fill={col.textMuted} fontFamily={F}>kcal</text>
    </svg>
  );
}


/* ═══════════════════════════════════════════════════════
   WEEK CHART — gráfico de barras 7 días
═══════════════════════════════════════════════════════ */
function WeekChart({data, meta, C, F}) {
  if(!data||!data.length) return null;
  const maxCal = Math.max(...data.map(d=>d.cal), meta||1, 100);
  const H=110, bW=32;
  const total = data.reduce((s,d)=>s+d.cal,0);
  const avg = Math.round(total/data.filter(d=>d.cal>0).length||0);
  return (
    <div>
      <svg width="100%" viewBox={`0 0 300 ${H+28}`} style={{overflow:'visible'}}>
        {data.map((d,i)=>{
          const x=4+i*42, barH=d.cal>0?Math.max(5,(d.cal/maxCal)*H):3;
          const y=H-barH, isToday=i===6, over=d.cal>meta;
          return (
            <g key={d.date}>
              <rect x={x} y={0} width={bW} height={H} rx={7} fill={C.border} opacity={0.25}/>
              <rect x={x} y={y} width={bW} height={barH} rx={7}
                fill={d.cal===0?C.border:over?C.red:'#007AFF'}
                opacity={isToday?1:0.55}
                style={{transition:'height .5s ease,y .5s ease'}}/>
              {isToday&&<rect x={x} y={y} width={bW} height={barH} rx={7} fill="url(#tg)" opacity={0.3}/>}
              <text x={x+bW/2} y={H+16} textAnchor="middle" fontSize={9}
                fill={isToday?C.text:C.textSec} fontWeight={isToday?700:400} fontFamily={F}>{d.label}</text>
              {d.cal>0&&<text x={x+bW/2} y={y-5} textAnchor="middle" fontSize={8} fill={isToday?C.text:C.textMuted} fontFamily={F}>{d.cal}</text>}
            </g>
          );
        })}
        {meta>0&&<line x1={0} y1={H-(meta/maxCal)*H} x2={300} y2={H-(meta/maxCal)*H}
          stroke={C.red} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.4}/>}
        <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity={0.4}/><stop offset="100%" stopColor="white" stopOpacity={0}/></linearGradient></defs>
      </svg>
      <div style={{display:'flex',justifyContent:'space-around',marginTop:6}}>
        {[{l:'Promedio',v:`${avg} kcal`},{l:'Meta',v:`${meta} kcal`},{l:'Total semana',v:`${Math.round(total/1000*10)/10}k`}].map(({l,v})=>(
          <div key={l} style={{textAlign:'center'}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{v}</div>
            <div style={{fontSize:10,color:C.textSec,fontWeight:400,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXERCISE SHEET
═══════════════════════════════════════════════════════ */
function ExerciseSheet({C, F, perfil, onAdd, onClose}) {
  const [sel,setSel]   = useState(null);
  const [mins,setMins] = useState(30);
  const burn = sel ? Math.round(sel.met * (perfil.peso||70) * (mins/60)) : 0;
  const cats = [...new Set(EXERCISES.map(e=>e.cat))];
  const [selCat,setSelCat] = useState('Cardio');
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:60,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 40px',animation:'slideUp .3s ease',maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:14}}>💪 Registrar ejercicio</div>
        {/* Cat filter */}
        <div style={{display:'flex',gap:6,marginBottom:12,overflowX:'auto',paddingBottom:2,scrollbarWidth:'none'}}>
          {cats.map(ct=>(
            <button key={ct} onClick={()=>setSelCat(ct)} style={{flexShrink:0,padding:'5px 12px',borderRadius:20,border:'none',background:selCat===ct?'#007AFF':'#007AFF18',color:selCat===ct?'white':'#007AFF',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>{ct}</button>
          ))}
        </div>
        {/* Exercise grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:16}}>
          {EXERCISES.filter(e=>e.cat===selCat).map(ex=>(
            <button key={ex.id} onClick={()=>setSel(sel?.id===ex.id?null:ex)} className="tap" style={{
              padding:'10px 6px',borderRadius:14,
              border:`1.5px solid ${sel?.id===ex.id?'#007AFF':C.border}`,
              background:sel?.id===ex.id?'#007AFF14':C.surfaceAlt,
              cursor:'pointer',fontFamily:F,textAlign:'center',
            }}>
              <div style={{fontSize:22,marginBottom:3}}>{ex.emoji}</div>
              <div style={{fontSize:9,fontWeight:600,color:sel?.id===ex.id?'#007AFF':C.textSec,lineHeight:1.2}}>{ex.nombre}</div>
            </button>
          ))}
        </div>
        {sel&&(
          <div style={{animation:'fadeUp .2s ease'}}>
            <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:8}}>Duración (minutos)</div>
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {[10,15,20,30,45,60].map(m=>(
                <button key={m} onClick={()=>setMins(m)} style={{flex:1,padding:'8px 2px',borderRadius:11,border:`1.5px solid ${mins===m?'#007AFF':C.border}`,background:mins===m?'#007AFF14':C.surfaceAlt,color:mins===m?'#007AFF':C.textSec,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>{m}′</button>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <button onClick={()=>setMins(Math.max(1,mins-5))} style={{width:36,height:36,borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:C.textSec,flexShrink:0}}>−</button>
              <input type="number" value={mins} onChange={e=>setMins(Math.max(1,+e.target.value||1))}
                style={{flex:1,padding:'10px',border:`1.5px solid #007AFF`,borderRadius:12,fontSize:18,fontWeight:800,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F,textAlign:'center'}}/>
              <span style={{fontSize:13,color:C.textSec}}>min</span>
              <button onClick={()=>setMins(mins+5)} style={{width:36,height:36,borderRadius:10,border:'none',background:'#007AFF',fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
            </div>
            <div style={{background:'#34C75914',borderRadius:14,padding:'12px 16px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid #34C75940'}}>
              <span style={{fontSize:13,color:C.textSec,fontWeight:500}}>Calorías quemadas est.</span>
              <span style={{fontSize:20,fontWeight:800,color:'#34C759'}}>−{burn} kcal</span>
            </div>
            <button className="tap" onClick={()=>{onAdd({...sel,mins,burn,uid:Date.now()});haptic('success');}} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:'#34C759',color:'white',fontSize:15,fontWeight:700,fontFamily:F,cursor:'pointer'}}>
              Agregar {sel.nombre} {mins}min
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CUSTOM FOOD SHEET
═══════════════════════════════════════════════════════ */
function CustomFoodSheet({C, F, onSave, onClose}) {
  const [food,setFood] = useState({nombre:'',marca:'Mis alimentos',cat:'Mis alimentos',porcion:100,cal:0,prot:0,carbs:0,grasas:0,fibra:0,emoji:'🍽️'});
  const emojis=['🍽️','🥘','🫕','🥗','🥙','🌮','🌯','🥪','🍱','🫙','🍲','🥧','🧆','🫔'];
  const valid = food.nombre.trim().length>0 && food.cal>0;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:60,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 40px',animation:'slideUp .3s ease',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:16}}>✨ Crear alimento propio</div>
        {/* Emoji picker */}
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:8,marginBottom:12,scrollbarWidth:'none'}}>
          {emojis.map(e=>(
            <button key={e} onClick={()=>setFood({...food,emoji:e})} style={{flexShrink:0,width:40,height:40,borderRadius:12,border:`2px solid ${food.emoji===e?'#007AFF':C.border}`,background:food.emoji===e?'#007AFF18':C.surfaceAlt,fontSize:20,cursor:'pointer'}}>{e}</button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{gridColumn:'1/-1'}}>
            <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Nombre del alimento</div>
            <input value={food.nombre} onChange={e=>setFood({...food,nombre:e.target.value})}
              placeholder="Ej: Ensalada de mi abuela"
              style={{width:'100%',padding:'12px 14px',border:`1.5px solid ${food.nombre?'#007AFF':C.border}`,borderRadius:13,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          </div>
          {[{l:'Porción (g)',k:'porcion'},{l:'Calorías (kcal)',k:'cal',bold:true},{l:'Proteínas (g)',k:'prot'},{l:'Carbohidratos (g)',k:'carbs'},{l:'Grasas (g)',k:'grasas'},{l:'Fibra (g)',k:'fibra'}].map(({l,k,bold})=>(
            <div key={k}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{l}</div>
              <input type="number" min="0" value={food[k]} onChange={e=>setFood({...food,[k]:+e.target.value||0})}
                style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${bold&&food[k]>0?'#007AFF':C.border}`,borderRadius:13,fontSize:16,fontWeight:bold?800:600,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
            </div>
          ))}
        </div>
        <button className="tap" onClick={()=>valid&&onSave({...food,id:Date.now()+9000,custom:true})} style={{
          width:'100%',padding:'15px',borderRadius:18,border:'none',
          background:valid?'#007AFF':'#C7C7CC',color:'white',
          fontSize:15,fontWeight:700,fontFamily:F,cursor:valid?'pointer':'default',
        }}>Guardar alimento</button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   BARCODE SCANNER — ZXing.js + getUserMedia manual
   Funciona en iOS Safari + Chrome Android + Firefox
═══════════════════════════════════════════════════════ */
function BarcodeScanner({C, F, onFound, onClose}) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const doneRef   = useRef(false);
  const timerRef  = useRef(null);

  const [status,  setStatus] = useState('loading');
  const [errMsg,  setErrMsg] = useState('');
  const [found,   setFound]  = useState(null);

  /* ── Limpieza total ── */
  const stopAll = () => {
    doneRef.current = true;
    try { clearTimeout(timerRef.current); } catch {}
    try { readerRef.current?.reset(); } catch {}
    try { readerRef.current?.stopContinuousDecode(); } catch {}
    try { streamRef.current?.getTracks().forEach(t=>{ try{t.stop();}catch{} }); } catch {}
    try { if(videoRef.current) { videoRef.current.srcObject=null; videoRef.current.pause(); } } catch {}
    streamRef.current = null;
    readerRef.current = null;
  };

  /* ── Lookup en Open Food Facts ── */
  const lookup = async(barcode) => {
    setStatus('looking');
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if(data.status===1){
        const p=data.product, n=p.nutriments||{};
        setFound({
          id:Date.now()+Math.random(),
          nombre:p.product_name_es||p.product_name||'Producto escaneado',
          marca:(p.brands||'').split(',')[0].trim()||'Desconocido',
          cat:'Escaneado',
          porcion:parseInt(p.serving_size_g)||parseInt(p.serving_size)||100,
          cal:Math.round(n['energy-kcal_100g']||0),
          prot:Math.round((n.proteins_100g||0)*10)/10,
          carbs:Math.round((n.carbohydrates_100g||0)*10)/10,
          grasas:Math.round((n.fat_100g||0)*10)/10,
          fibra:Math.round((n.fiber_100g||0)*10)/10,
          emoji:'📦', barcode,
        });
        setStatus('found');
      } else {
        setStatus('error');
        setErrMsg(`Código ${barcode} no encontrado. Prueba con otro producto.`);
      }
    } catch {
      setStatus('error');
      setErrMsg('Sin conexión. Verifica tu internet e intenta de nuevo.');
    }
  };

  /* ── Carga ZXing desde CDN ── */
  const loadZXing = () => new Promise((resolve,reject)=>{
    if(window.ZXing) return resolve();
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js';
    s.onload=resolve;
    s.onerror=()=>reject(new Error('No se pudo cargar el escáner'));
    document.head.appendChild(s);
  });

  /* ── Inicio de cámara ── */
  const startScanner = async() => {
    doneRef.current = false;
    setStatus('loading');
    setErrMsg('');
    setFound(null);

    try {
      /* 1. Cargar ZXing */
      await loadZXing();
      if(doneRef.current) return;

      /* 2. Pedir permiso de cámara con preferencia trasera */
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720} }
      });
      if(doneRef.current){ stream.getTracks().forEach(t=>t.stop()); return; }
      streamRef.current = stream;

      /* 3. Conectar stream al <video> */
      const vid = videoRef.current;
      vid.srcObject = stream;
      vid.setAttribute('playsinline','');
      vid.muted = true;

      await new Promise((resolve,reject)=>{
        vid.onloadedmetadata = resolve;
        vid.onerror = reject;
        setTimeout(resolve, 3000); // fallback
      });
      await vid.play().catch(()=>{});
      if(doneRef.current) return;
      setStatus('scanning');

      /* 4. ZXing decode loop — usa el stream que ya tenemos */
      const reader = new window.ZXing.BrowserMultiFormatReader();
      readerRef.current = reader;

      /* decodeFromStream pasa el stream existente a ZXing */
      await reader.decodeFromStream(stream, vid, async(result, err)=>{
        if(doneRef.current) return;
        if(result){
          doneRef.current = true;
          reader.reset();
          stream.getTracks().forEach(t=>t.stop());
          await lookup(result.getText());
        }
        /* err = NotFoundException en cada frame sin código — normal, ignorar */
      });

    } catch(e) {
      if(doneRef.current) return;
      setStatus('error');
      if(e.name==='NotAllowedError'||e.name==='PermissionDeniedError')
        setErrMsg('Permiso de cámara denegado. Ve a Configuración › permisos del sitio y permite la cámara.');
      else if(e.name==='NotFoundError')
        setErrMsg('No se detectó ninguna cámara en este dispositivo.');
      else if(e.message?.includes('cargar'))
        setErrMsg('No se pudo cargar el escáner. Verifica tu conexión a internet.');
      else
        setErrMsg(`Error al iniciar la cámara. ${e.message||''}`);
    }
  };

  useEffect(()=>{ startScanner(); return stopAll; },[]);

  const retry = () => { stopAll(); setTimeout(startScanner, 300); };

  /* ── UI ── */
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:70,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 48px',animation:'slideUp .3s ease'}}>

        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>📷 Escanear código de barras</div>
          <div style={{fontSize:10,color:'#34C759',background:'#34C75914',padding:'3px 9px',borderRadius:8,fontWeight:700,border:'1px solid #34C75940'}}>iOS + Android ✓</div>
        </div>

        {/* Video — SIEMPRE renderizado para que el ref esté disponible */}
        <div style={{
          position:'relative',borderRadius:20,overflow:'hidden',background:'#000',
          marginBottom:14,aspectRatio:'4/3',maxHeight:260,
          display:(status==='scanning'||status==='loading')?'block':'none',
        }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>

          {/* Guía de encuadre — solo cuando ya está escaneando */}
          {status==='scanning'&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <div style={{position:'relative',width:'72%',height:88}}>
                {[{t:0,l:0,bt:'3px solid white',bl:'3px solid white',br:0,bb:0,rr:'4px 0 0 0'},
                  {t:0,r:0,bt:'3px solid white',br:'3px solid white',bl:0,bb:0,rr:'0 4px 0 0'},
                  {b:0,l:0,bb:'3px solid white',bl:'3px solid white',bt:0,br:0,rr:'0 0 0 4px'},
                  {b:0,r:0,bb:'3px solid white',br:'3px solid white',bt:0,bl:0,rr:'0 0 4px 0'},
                ].map((s,i)=>(
                  <div key={i} style={{position:'absolute',width:22,height:22,...s}}/>
                ))}
                <div style={{position:'absolute',top:'50%',left:0,right:0,height:2,background:'rgba(52,199,89,0.85)',boxShadow:'0 0 8px rgba(52,199,89,0.5)'}}/>
              </div>
            </div>
          )}

          <div style={{position:'absolute',bottom:10,left:0,right:0,textAlign:'center',fontSize:12,color:'rgba(255,255,255,0.75)',fontFamily:F,fontWeight:500}}>
            {status==='scanning'?'Apunta al código de barras':'Iniciando cámara...'}
          </div>
        </div>

        {/* Buscando */}
        {status==='looking'&&(
          <div style={{textAlign:'center',padding:'28px 0 20px',marginBottom:8}}>
            <div style={{fontSize:44,marginBottom:10}}>🔍</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>Buscando producto...</div>
            <div style={{fontSize:12,color:C.textSec}}>Consultando base de datos mundial</div>
          </div>
        )}

        {/* Encontrado */}
        {status==='found'&&found&&(
          <div style={{animation:'fadeUp .3s ease'}}>
            <div style={{display:'flex',gap:12,alignItems:'center',padding:'14px',background:C.surfaceAlt,borderRadius:16,marginBottom:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:40}}>{found.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.3}}>{found.nombre}</div>
                <div style={{fontSize:12,color:C.textSec,marginTop:2}}>{found.marca}</div>
                <div style={{fontSize:13,fontWeight:800,color:'#007AFF',marginTop:4}}>{found.cal} kcal / {found.porcion}g</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:14}}>
              {[{l:'Prot',v:`${found.prot}g`,c:C.red},{l:'Carbs',v:`${found.carbs}g`,c:C.amber},{l:'Grasas',v:`${found.grasas}g`,c:C.purple},{l:'Fibra',v:`${found.fibra}g`,c:C.green}].map(({l,v,c})=>(
                <div key={l} style={{background:C.surfaceAlt,borderRadius:13,padding:'10px 6px',textAlign:'center',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:15,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                  <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:'uppercase',marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="tap" onClick={retry} style={{flex:1,padding:'13px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F}}>Escanear otro</button>
              <button className="tap" onClick={()=>{
                stopAll();
                setTimeout(()=>onFound(found), 150);
              }} style={{flex:2,padding:'13px',borderRadius:16,border:'none',background:'#007AFF',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F}}>Agregar al diario</button>
            </div>
          </div>
        )}

        {/* Error */}
        {status==='error'&&(
          <div style={{textAlign:'center',padding:'16px 8px 8px',marginBottom:8}}>
            <div style={{fontSize:40,marginBottom:10}}>😕</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:8}}>No se pudo escanear</div>
            <div style={{fontSize:12,color:C.textSec,lineHeight:1.6,marginBottom:16}}>{errMsg}</div>
            <button className="tap" onClick={retry} style={{padding:'12px 28px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F}}>Intentar de nuevo</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RECIPE BUILDER — combinar ingredientes
═══════════════════════════════════════════════════════ */
function RecipeBuilder({C, F, allFoods, onSave, onClose}) {
  const [name, setName]   = useState('');
  const [ingrs, setIngrs] = useState([]);
  const [search, setSearch] = useState('');
  const [emoji, setEmoji] = useState('🍲');

  const filtered = search.length>1
    ? allFoods.filter(f=>f.nombre.toLowerCase().includes(search.toLowerCase())).slice(0,15)
    : [];

  const addIngr = (food) => {
    setIngrs([...ingrs,{...food,gramsR:food.porcion||100,uid:Date.now()}]);
    setSearch('');
  };

  const totals = ingrs.reduce((a,i)=>{
    const r=i.gramsR/(i.porcion||100);
    return {cal:a.cal+i.cal*r, prot:a.prot+i.prot*r, carbs:a.carbs+i.carbs*r, grasas:a.grasas+i.grasas*r, fibra:a.fibra+i.fibra*r};
  },{cal:0,prot:0,carbs:0,grasas:0,fibra:0});

  const valid = name.trim().length>0 && ingrs.length>0;
  const emojis = ['🍲','🥘','🫕','🥗','🥙','🌮','🌯','🥪','🍱','🫙','🍝','🥧','🫔','🍛'];

  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:65,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 40px',animation:'slideUp .3s ease',maxHeight:'92vh',overflowY:'auto'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:14}}>👨‍🍳 Crear receta propia</div>

        {/* Emoji + name */}
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:10,scrollbarWidth:'none'}}>
          {emojis.map(e=>(
            <button key={e} onClick={()=>setEmoji(e)} style={{flexShrink:0,width:38,height:38,borderRadius:11,border:`2px solid ${emoji===e?'#007AFF':C.border}`,background:emoji===e?'#007AFF18':C.surfaceAlt,fontSize:20,cursor:'pointer'}}>{e}</button>
          ))}
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre de la receta"
          style={{width:'100%',padding:'12px 14px',border:`1.5px solid ${name?'#007AFF':C.border}`,borderRadius:13,fontSize:15,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none',marginBottom:14}}/>

        {/* Ingredient search */}
        <div style={{position:'relative',marginBottom:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar ingrediente..."
            style={{width:'100%',padding:'11px 14px',border:`1px solid ${C.border}`,borderRadius:13,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          {filtered.length>0&&(
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,zIndex:10,maxHeight:200,overflowY:'auto',boxShadow:'0 8px 24px rgba(0,0,0,0.15)'}}>
              {filtered.map(f=>(
                <div key={f.id} onClick={()=>addIngr(f)} style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:18}}>{f.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.nombre}</div>
                    <div style={{fontSize:11,color:C.textSec}}>{f.cal} kcal / {f.porcion}g</div>
                  </div>
                  <span style={{fontSize:16,color:'#007AFF'}}>+</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients list */}
        {ingrs.length>0&&(
          <div style={{marginBottom:14}}>
            {ingrs.map((ingr,i)=>(
              <div key={ingr.uid} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:18,flexShrink:0}}>{ingr.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ingr.nombre}</div>
                  <div style={{fontSize:10,color:C.textSec}}>{Math.round(ingr.cal*(ingr.gramsR/(ingr.porcion||100)))} kcal</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
                  <button onClick={()=>setIngrs(ingrs.map((x,j)=>j===i?{...x,gramsR:Math.max(5,x.gramsR-10)}:x))} style={{width:26,height:26,borderRadius:7,border:`1px solid ${C.border}`,background:C.surfaceAlt,fontSize:14,cursor:'pointer',color:C.textSec,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                  <span style={{fontSize:13,fontWeight:700,color:C.text,minWidth:32,textAlign:'center'}}>{ingr.gramsR}g</span>
                  <button onClick={()=>setIngrs(ingrs.map((x,j)=>j===i?{...x,gramsR:x.gramsR+10}:x))} style={{width:26,height:26,borderRadius:7,border:'none',background:'#007AFF',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                </div>
                <button onClick={()=>setIngrs(ingrs.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.red,fontSize:14,cursor:'pointer',padding:2,flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {ingrs.length>0&&(
          <div style={{background:'#007AFF0C',borderRadius:14,padding:'12px 14px',marginBottom:14,border:'1px solid #007AFF25'}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Total de la receta</div>
            <div style={{display:'flex',gap:10}}>
              {[{l:'Kcal',v:Math.round(totals.cal)},{l:'Prot',v:Math.round(totals.prot)+'g'},{l:'Carbs',v:Math.round(totals.carbs)+'g'},{l:'Grasas',v:Math.round(totals.grasas)+'g'}].map(({l,v})=>(
                <div key={l} style={{flex:1,textAlign:'center'}}>
                  <div style={{fontSize:15,fontWeight:800,color:'#007AFF',lineHeight:1}}>{v}</div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:2,textTransform:'uppercase'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="tap" onClick={()=>{
          if(!valid) return;
          const recipe={
            id:Date.now()+8000,
            nombre:name.trim(),
            marca:'Mis recetas',
            cat:'Mis recetas',
            porcion:Math.round(ingrs.reduce((s,i)=>s+i.gramsR,0)),
            cal:Math.round(totals.cal),
            prot:Math.round(totals.prot*10)/10,
            carbs:Math.round(totals.carbs*10)/10,
            grasas:Math.round(totals.grasas*10)/10,
            fibra:Math.round(totals.fibra*10)/10,
            emoji,
            ingredients:ingrs.map(i=>({id:i.id,nombre:i.nombre,grams:i.gramsR})),
            custom:true, recipe:true,
          };
          onSave(recipe);
        }} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:valid?'#007AFF':'#C7C7CC',color:'white',fontSize:15,fontWeight:700,fontFamily:F,cursor:valid?'pointer':'default'}}>
          Guardar receta
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WEEKLY PLANNER + SHOPPING LIST
═══════════════════════════════════════════════════════ */
function WeeklyPlanner({C, F, allFoods, onClose}) {
  const [plan, setPlan]      = useState(()=>{ try{return JSON.parse(localStorage.getItem('caloru_weekplan')||'{}')}catch{return {}} });
  const [pickSlot, setPickSlot] = useState(null); // {dayKey, meal}
  const [search, setSearch]  = useState('');
  const [view, setView]      = useState('plan'); // plan | shopping

  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-d.getDay()+1+i);
    return {key:d.toISOString().slice(0,10), label:d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric'})};
  });

  const save = (newPlan) => {
    setPlan(newPlan);
    try{ localStorage.setItem('caloru_weekplan', JSON.stringify(newPlan)); }catch{}
  };

  const addToPlan = (food) => {
    if(!pickSlot) return;
    const {dayKey,meal} = pickSlot;
    const curr = plan[dayKey]?.[meal]||[];
    save({...plan,[dayKey]:{...plan[dayKey],[meal]:[...curr,{...food,uid:Date.now()}]}});
    setPickSlot(null); setSearch('');
  };

  const removePlan = (dayKey, meal, uid) => {
    const curr = (plan[dayKey]?.[meal]||[]).filter(f=>f.uid!==uid);
    const newDay = {...plan[dayKey],[meal]:curr};
    save({...plan,[dayKey]:newDay});
  };

  // Shopping list aggregation
  const shopItems = useMemo(()=>{
    const map = {};
    Object.values(plan).forEach(day=>{
      Object.values(day).forEach(meals=>{
        meals.forEach(food=>{
          if(map[food.nombre]) map[food.nombre].count++;
          else map[food.nombre]={...food,count:1};
        });
      });
    });
    return Object.values(map).sort((a,b)=>a.cat?.localeCompare(b.cat||'')||0);
  },[plan]);

  const filtered = search.length>1 ? allFoods.filter(f=>f.nombre.toLowerCase().includes(search.toLowerCase())).slice(0,12) : [];

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:80,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#007AFF',fontFamily:F,fontWeight:600,padding:4}}>✕ Cerrar</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>
          {view==='plan'?'🗓️ Planificador semanal':'🛒 Lista de compras'}
        </div>
        <button onClick={()=>setView(view==='plan'?'shopping':'plan')} style={{background:'#007AFF18',border:'none',padding:'6px 12px',borderRadius:12,fontSize:12,fontWeight:700,color:'#007AFF',cursor:'pointer',fontFamily:F,flexShrink:0}}>
          {view==='plan'?'🛒 Compras':'🗓️ Plan'}
        </button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        {view==='plan'&&(
          <>
            {days.map(({key,label})=>(
              <div key={key} style={{marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:700,color:C.textSec,marginBottom:8,textTransform:'uppercase',letterSpacing:.4}}>{label}</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {['Desayuno','Almuerzo','Once','Cena','Snack'].map(meal=>{
                    const items=plan[key]?.[meal]||[];
                    const cal=items.reduce((s,f)=>s+f.cal,0);
                    return(
                      <div key={meal} style={{background:C.surface,borderRadius:14,padding:'10px 12px',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:10,background:`${MC[meal]}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{MI[meal]}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.text}}>{meal}</div>
                          {items.length>0?(
                            <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                              {items.map(f=>(
                                <span key={f.uid} onClick={()=>removePlan(key,meal,f.uid)} style={{fontSize:10,background:C.surfaceAlt,color:C.textSec,padding:'2px 8px',borderRadius:8,cursor:'pointer'}}>{f.emoji} {f.nombre.split(' ').slice(0,2).join(' ')} ✕</span>
                              ))}
                            </div>
                          ):<div style={{fontSize:10,color:C.textMuted}}>Vacío</div>}
                        </div>
                        {cal>0&&<div style={{fontSize:12,fontWeight:700,color:MC[meal],flexShrink:0}}>{cal} kcal</div>}
                        <button onClick={()=>setPickSlot({dayKey:key,meal})} style={{width:28,height:28,borderRadius:8,border:'none',background:'#007AFF18',color:'#007AFF',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {view==='shopping'&&(
          <>
            {shopItems.length===0?(
              <div style={{textAlign:'center',padding:'60px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>🛒</div>
                <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Lista vacía</div>
                <div style={{fontSize:13,color:C.textSec}}>Agrega comidas al planificador para generar tu lista de compras automáticamente</div>
              </div>
            ):(
              <>
                <div style={{fontSize:13,color:C.textSec,marginBottom:12,fontWeight:500}}>{shopItems.length} productos para la semana</div>
                {shopItems.map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.nombre}</div>
                      <div style={{fontSize:11,color:C.textSec}}>{item.marca} · {item.count}x esta semana</div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:'#007AFF',flexShrink:0}}>{item.cal} kcal/p</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Food picker overlay */}
      {pickSlot&&(
        <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end',zIndex:10}}>
          <div onClick={()=>{setPickSlot(null);setSearch('');}} style={{position:'absolute',inset:0}}/>
          <div style={{width:'100%',background:C.surface,borderRadius:'24px 24px 0 0',padding:'16px 16px 40px',zIndex:1,maxHeight:'60vh',overflowY:'auto'}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Agregar a {pickSlot.meal}</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} autoFocus placeholder="Buscar alimento..."
              style={{width:'100%',padding:'11px 14px',border:`1px solid ${C.border}`,borderRadius:13,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',marginBottom:8}}/>
            {filtered.map(f=>(
              <div key={f.id} onClick={()=>addToPlan(f)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:`1px solid ${C.border}`,cursor:'pointer'}}>
                <span style={{fontSize:20}}>{f.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{f.cal} kcal</div>
                </div>
                <span style={{fontSize:16,color:'#007AFF',fontWeight:700}}>+</span>
              </div>
            ))}
            {search.length>1&&filtered.length===0&&<div style={{textAlign:'center',padding:'20px',color:C.textMuted,fontSize:13}}>Sin resultados</div>}
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   FOOD SUGGESTIONS PANEL
═══════════════════════════════════════════════════════ */
function SuggestionsPanel({obj, meal, C, F, allFoods, onSelect}) {
  const [activeGroup, setActiveGroup] = useState(0);
  const sug = SUGGESTIONS[obj] || SUGGESTIONS.mantener;

  const hr = new Date().getHours();
  const timeKey = hr<10?'desayuno':hr<14?'almuerzo':hr<18?'once':hr<21?'cena':'snack';
  const timeSug = TIME_SUGGESTIONS[timeKey];

  const getFoods = (ids) => ids
    .map(id => allFoods.find(f => f.id===id))
    .filter(Boolean);

  const FoodChip = ({food}) => (
    <button className="tap" onClick={()=>onSelect(food)} style={{
      display:'flex',alignItems:'center',gap:8,
      background:C.surface,border:`1px solid ${C.border}`,
      borderRadius:16,padding:'10px 12px',
      cursor:'pointer',fontFamily:F,flexShrink:0,
      minWidth:160,maxWidth:200,
      transition:'all .18s ease',
      boxShadow:C===C?'none':'none',
    }}>
      <span style={{fontSize:22,flexShrink:0}}>{food.emoji}</span>
      <div style={{flex:1,minWidth:0,textAlign:'left'}}>
        <div style={{fontSize:11,fontWeight:700,color:C.text,lineHeight:1.2,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{food.nombre}</div>
        <div style={{fontSize:10,color:sug.color,fontWeight:700,marginTop:2}}>{food.cal} kcal</div>
      </div>
    </button>
  );

  return (
    <div style={{background:C.surface,borderRadius:22,overflow:'hidden',
      border:`1px solid ${C.border}`,marginBottom:12,
      boxShadow:'none',
    }}>
      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg,${sug.color}18,${sug.color}08)`,
        padding:'14px 16px 10px',
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:sug.color,flexShrink:0}}/>
          <div style={{fontSize:13,fontWeight:800,color:C.text}}>{sug.label}</div>
        </div>
        <div style={{fontSize:11,color:C.textSec,fontWeight:400}}>{sug.tip}</div>
      </div>

      {/* Time-based quick suggestion */}
      <div style={{padding:'12px 16px 0'}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,
          textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
          {timeSug.label} · Ahora
        </div>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:10,scrollbarWidth:'none'}}>
          {getFoods(timeSug.ids).slice(0,6).map(f=>(
            <FoodChip key={f.id} food={f}/>
          ))}
        </div>
      </div>

      {/* Group tabs */}
      <div style={{display:'flex',gap:0,borderTop:`1px solid ${C.border}`,overflowX:'auto',scrollbarWidth:'none'}}>
        {sug.groups.map((g,i)=>(
          <button key={i} onClick={()=>setActiveGroup(i)} style={{
            flex:1,padding:'9px 4px',border:'none',
            background:'none',cursor:'pointer',fontFamily:F,
            borderBottom:`2px solid ${activeGroup===i?sug.color:'transparent'}`,
            transition:'all .15s',minWidth:70,flexShrink:0,
          }}>
            <div style={{fontSize:16}}>{g.title.split(' ')[0]}</div>
            <div style={{fontSize:9,color:activeGroup===i?sug.color:C.textMuted,fontWeight:600,marginTop:1,
              lineHeight:1.2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',padding:'0 2px'}}>
              {g.title.split(' ').slice(1).join(' ')}
            </div>
          </button>
        ))}
      </div>

      {/* Foods in selected group */}
      <div style={{padding:'10px 16px 14px'}}>
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:2,scrollbarWidth:'none'}}>
          {getFoods(sug.groups[activeGroup]?.ids||[]).map(f=>(
            <FoodChip key={f.id} food={f}/>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   WEEKLY SUMMARY COMPONENT
═══════════════════════════════════════════════════════ */
function WeeklySummary({C, F, metas, streak, onClose}) {
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=d.toISOString().slice(0,10);
    const dayLog=LS.get('log_'+key,[]);
    const exs=LS.get('ex_'+key,[]);
    return {
      key, label:d.toLocaleDateString('es-CL',{weekday:'short'}),
      cal:Math.round(sumLog(dayLog).cal),
      prot:Math.round(sumLog(dayLog).prot),
      burned:exs.reduce((s,e)=>s+e.burn,0),
      logged:dayLog.length>0,
    };
  });

  const daysLogged  = days.filter(d=>d.logged).length;
  const avgCal      = Math.round(days.filter(d=>d.cal>0).reduce((s,d)=>s+d.cal,0) / Math.max(1,daysLogged));
  const daysOnGoal  = days.filter(d=>d.cal>0&&d.cal<=metas.cal).length;
  const totalBurned = days.reduce((s,d)=>s+d.burned,0);
  const maxCal      = Math.max(...days.map(d=>d.cal),metas.cal,100);

  const score = Math.round((daysLogged/7)*40 + (daysOnGoal/Math.max(1,daysLogged))*40 + Math.min(streak.days/7,1)*20);
  const scoreLabel = score>=80?'🏆 Excelente':score>=60?'💪 Muy bien':score>=40?'👍 Bien':'🌱 Mejorando';

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:85,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#007AFF',fontFamily:F,fontWeight:600,padding:4}}>← Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📊 Resumen semanal</div>
        <div style={{width:60}}/>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {/* Score card */}
        <div style={{
          background:`linear-gradient(145deg,#1A2C22,#0D1710)`,
          borderRadius:24,padding:'22px',marginBottom:14,
          boxShadow:'0 8px 28px rgba(0,0,0,0.3)',
        }}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Esta semana</div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
            <div style={{
              width:80,height:80,borderRadius:'50%',
              background:`conic-gradient(#34C759 ${score*3.6}deg, rgba(255,255,255,0.1) 0deg)`,
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'#1A2C22',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:'white',lineHeight:1}}>{score}</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.4)'}}>pts</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:'white',lineHeight:1,marginBottom:4}}>{scoreLabel}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.4}}>
                {daysLogged} de 7 días registrados<br/>
                {daysOnGoal} días en meta · Racha: {streak.days} días
              </div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div style={{display:'flex',gap:5,alignItems:'flex-end',height:60}}>
            {days.map(d=>{
              const h=d.cal>0?Math.max(6,(d.cal/maxCal)*54):3;
              const isOver=d.cal>metas.cal, isToday=d.key===new Date().toISOString().slice(0,10);
              return(
                <div key={d.key} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{width:'100%',height:h,borderRadius:5,background:isToday?'#6ECC8A':isOver?'#FF3B30':'rgba(255,255,255,0.35)',transition:'height .5s ease'}}/>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.4)',fontWeight:isToday?700:400}}>{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[
            {icon:'🔥',l:'Promedio diario',v:`${avgCal} kcal`,c:'#FF9500'},
            {icon:'🎯',l:'Días en meta',v:`${daysOnGoal}/7`,c:'#34C759'},
            {icon:'💪',l:'Kcal quemadas',v:`${totalBurned}`,c:'#007AFF'},
            {icon:'📈',l:'Racha actual',v:`${streak.days} días`,c:'#AF52DE'},
          ].map(({icon,l,v,c})=>(
            <div key={l} style={{background:C.surface,borderRadius:18,padding:'16px',border:`1px solid ${C.border}`}}>
              <div style={{fontSize:26,marginBottom:6}}>{icon}</div>
              <div style={{fontSize:20,fontWeight:800,color:c,lineHeight:1,letterSpacing:'-.5px'}}>{v}</div>
              <div style={{fontSize:11,color:C.textSec,fontWeight:400,marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Day breakdown */}
        <div style={{background:C.surface,borderRadius:20,padding:'16px',border:`1px solid ${C.border}`,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Detalle por día</div>
          {days.map(d=>(
            <div key={d.key} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:34,height:34,borderRadius:10,
                background:d.logged?(d.cal>metas.cal?'#FF3B3018':'#34C75918'):'#F2F2F7',
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontSize:14}}>{d.logged?(d.cal>metas.cal?'⚠️':'✅'):'—'}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,textTransform:'capitalize'}}>{d.label}</div>
                {d.logged&&<div style={{fontSize:11,color:C.textSec}}>{d.cal} kcal · P:{d.prot}g{d.burned>0?` · 🔥${d.burned}`:''}</div>}
                {!d.logged&&<div style={{fontSize:11,color:C.textMuted}}>Sin registro</div>}
              </div>
              {d.cal>0&&(
                <div style={{width:60,height:5,background:C.border,borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.min(d.cal/metas.cal*100,100)}%`,background:d.cal>metas.cal?'#FF3B30':'#34C759',borderRadius:3}}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Motivational message */}
        <div style={{background:score>=60?'#34C75914':'#007AFF14',borderRadius:18,padding:'16px',
          border:`1px solid ${score>=60?'#34C75940':'#007AFF40'}`,textAlign:'center'}}>
          <div style={{fontSize:28,marginBottom:8}}>{score>=80?'🏆':score>=60?'💪':score>=40?'📈':'🌱'}</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>
            {score>=80?'¡Semana increíble!'
             :score>=60?'¡Muy buen trabajo!'
             :score>=40?'¡Vas por buen camino!'
             :'¡La próxima semana mejor!'}
          </div>
          <div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>
            {score>=80?`Registraste ${daysLogged} días y cumpliste tu meta ${daysOnGoal} veces. ¡Sigue así!`
             :score>=60?`${daysLogged} días registrados. Con un poco más de constancia llegas a 100.`
             :score>=40?`Cada día que registras es un día que avanzas. La constancia es la clave.`
             :`No importa cuántas veces empezamos, lo que importa es no parar.`}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARE PROGRESS — genera imagen para compartir
═══════════════════════════════════════════════════════ */
function ShareCard({C, F, nombre, tot, metas, obj, streak, exercises, onClose}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const objLabels={bajar:'Bajando de peso',mantener:'Manteniendo peso',recomp:'Recomposición',subir:'Ganando masa'};
  const pct = metas.cal>0?Math.min(tot.cal/metas.cal,1):0;
  const burned = exercises.reduce((s,e)=>s+e.burn,0);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const W=400, H=500;
    canvas.width=W; canvas.height=H;

    // Background gradient
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#1A2C22'); bg.addColorStop(1,'#0D1710');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Dot grid
    ctx.fillStyle='rgba(255,255,255,0.04)';
    for(let x=0;x<W;x+=22) for(let y=0;y<H;y+=22) { ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill(); }

    // App badge
    ctx.fillStyle='rgba(255,255,255,0.08)';
    const roundRect=(ctx,x,y,w,h,r)=>{
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  };

    roundRect(ctx,20,20,120,34,17); ctx.fill();
    ctx.fillStyle='white'; ctx.font='bold 14px system-ui';
    ctx.fillText('🍽️ Calorú',32,42);

    // Date
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='12px system-ui';
    ctx.textAlign='right';
    ctx.fillText(new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'}),W-20,42);
    ctx.textAlign='left';

    // Name
    ctx.fillStyle='white'; ctx.font='bold 28px system-ui';
    ctx.fillText(`Hoy de ${nombre.split(' ')[0]}`, 20, 100);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='14px system-ui';
    ctx.fillText(objLabels[obj]||'', 20, 124);

    // Big calorie number
    ctx.fillStyle='#6ECC8A'; ctx.font='bold 72px system-ui';
    ctx.fillText(Math.round(tot.cal), 20, 210);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='16px system-ui';
    ctx.fillText('kcal consumidas', 20, 232);

    // Progress ring (SVG-style on canvas)
    const cx=W-80, cy=190, r=55;
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=10; ctx.beginPath();
    ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=tot.cal>metas.cal?'#FF3B30':'#34C759';
    ctx.lineCap='round'; ctx.beginPath();
    ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+pct*Math.PI*2); ctx.stroke();
    ctx.fillStyle='white'; ctx.font='bold 18px system-ui'; ctx.textAlign='center';
    ctx.fillText(Math.round(pct*100)+'%',cx,cy+6);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='10px system-ui';
    ctx.fillText('de meta',cx,cy+22); ctx.textAlign='left';

    // Macro bars
    const macros=[
      {l:'Proteínas',v:tot.prot,m:metas.prot,c:'#FF6B6B'},
      {l:'Carbohidratos',v:tot.carbs,m:metas.carbs,c:'#FFD93D'},
      {l:'Grasas',v:tot.grasas,m:metas.grasas,c:'#C77DFF'},
    ];
    let my=270;
    macros.forEach(({l,v,m,c})=>{
      ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='11px system-ui';
      ctx.fillText(l,20,my);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 11px system-ui'; ctx.textAlign='right';
      ctx.fillText(`${Math.round(v)}/${m}g`,W-20,my); ctx.textAlign='left';
      ctx.fillStyle='rgba(255,255,255,0.08)';
      roundRect(ctx,20,my+6,W-40,6,3); ctx.fill();
      ctx.fillStyle=c;
      roundRect(ctx,20,my+6,Math.max(6,(v/Math.max(m,1))*(W-40)),6,3); ctx.fill();
      my+=36;
    });

    // Streak + exercise
    if(streak.days>0||burned>0){
      ctx.fillStyle='rgba(255,255,255,0.06)';
      roundRect(ctx,20,my,W-40,54,14); ctx.fill();
      if(streak.days>0){
        ctx.fillStyle='white'; ctx.font='bold 13px system-ui';
        ctx.fillText(`🔥 ${streak.days} días de racha`,30,my+22);
      }
      if(burned>0){
        ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='12px system-ui';
        ctx.fillText(`💪 ${burned} kcal quemadas`,30,my+42);
      }
      my+=70;
    }

    // Watermark
    ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.font='11px system-ui'; ctx.textAlign='center';
    ctx.fillText('Descarga Calorú 🇨🇱 — nutri-mitchaaels-projects.vercel.app',W/2,H-16);

    setReady(true);
  },[]);

  /* roundRect moved above */

  const share = async()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    try {
      canvas.toBlob(async(blob)=>{
        try {
          await navigator.share({files:[new File([blob],'caloru-progreso.png',{type:'image/png'})],title:'Mi progreso en Calorú'});
        } catch {
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a'); a.href=url; a.download='caloru-progreso.png'; a.click();
          URL.revokeObjectURL(url);
        }
      },'image/png');
    } catch(e){ console.error(e); }
    haptic('success');
  };

  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:90,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 44px',animation:'slideUp .3s ease'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:16}}>📤 Compartir mi progreso</div>
        <div style={{borderRadius:18,overflow:'hidden',marginBottom:14,border:`1px solid ${C.border}`}}>
          <canvas ref={canvasRef} style={{width:'100%',height:'auto',display:'block'}}/>
        </div>
        {ready&&<button className="tap" onClick={share} style={{
          width:'100%',padding:'15px',borderRadius:18,border:'none',
          background:'linear-gradient(135deg,#1A2C22,#285C3E)',color:'white',
          fontSize:15,fontWeight:700,fontFamily:F,cursor:'pointer',
          boxShadow:'0 8px 24px rgba(26,44,34,0.4)',
        }}>📤 Compartir imagen</button>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MODAL DETALLE CON AJUSTE DE GRAMOS
═══════════════════════════════════════════════════════ */
function ModalDetalle({food, meal, C, F, onClose, onAdd, onFav, isFav}) {
  const [grams, setGrams] = useState(food.porcion || 100);
  const [mode, setMode] = useState('porcion'); // 'porcion' | 'gramos'

  useEffect(()=>{ setGrams(food.porcion||100); setMode('porcion'); },[food.id]);

  const r = grams / (food.porcion || 100);
  const v = (x) => Math.round(x * r * 10) / 10;

  const gramsPresets = food.porcion
    ? [Math.round(food.porcion*0.5), food.porcion, Math.round(food.porcion*1.5), Math.round(food.porcion*2)]
    : [50, 100, 150, 200];

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:50,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',
        padding:'20px 20px 40px',animation:'slideUp .3s ease',maxHeight:'90vh',overflowY:'auto',
      }}>
        {/* Handle */}
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 18px'}}/>

        {/* Header */}
        <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:18}}>
          <div style={{width:58,height:58,borderRadius:17,background:C.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,flexShrink:0}}>{food.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,lineHeight:1.3}}>{food.nombre}</div>
            <div style={{fontSize:12,color:C.textSec,fontWeight:500,marginTop:3}}>{food.marca} · {food.cat}</div>
            {food.porcion&&<div style={{fontSize:11,color:C.textMuted,fontWeight:500,marginTop:2}}>Porción de referencia: {food.porcion}g</div>}
          </div>
        </div>

        {/* Toggle porcion / gramos */}
        <div style={{display:'flex',gap:0,background:C.surfaceAlt,borderRadius:14,padding:3,marginBottom:16}}>
          {[{v:'porcion',l:'Por porción'},{v:'gramos',l:'Por gramos'}].map(({v,l})=>(
            <button key={v} onClick={()=>{setMode(v);if(v==='porcion')setGrams(food.porcion||100);}} style={{
              flex:1,padding:'9px',borderRadius:11,border:'none',fontFamily:F,
              background:mode===v?C.surface:'transparent',
              color:mode===v?C.text:C.textSec,
              fontSize:13,fontWeight:mode===v?800:500,cursor:'pointer',
              transition:'all .2s',
            }}>{l}</button>
          ))}
        </div>

        {/* Gram selector */}
        {mode==='gramos'&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:8,fontFamily:F}}>Cantidad en gramos</div>
            {/* Quick presets */}
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {gramsPresets.map(g=>(
                <button key={g} onClick={()=>setGrams(g)} style={{
                  flex:1,padding:'8px 4px',borderRadius:11,
                  border:`1.5px solid ${grams===g?'#007AFF':C.border}`,
                  background:grams===g?'#007AFF14':C.surfaceAlt,
                  color:grams===g?'#007AFF':C.textSec,
                  fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
                  transition:'all .15s',textAlign:'center',
                }}>{g}g</button>
              ))}
            </div>
            {/* Custom input */}
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <button onClick={()=>setGrams(Math.max(1,grams-5))} style={{width:38,height:38,borderRadius:11,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:C.textSec,flexShrink:0}}>−</button>
              <div style={{flex:1,position:'relative'}}>
                <input type="number" value={grams} onChange={e=>setGrams(Math.max(1,+e.target.value||1))}
                  style={{width:'100%',padding:'11px 36px 11px 14px',border:`1.5px solid ${C.primary}`,borderRadius:13,fontSize:18,fontWeight:800,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F,textAlign:'center'}}/>
                <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',fontSize:13,color:C.textSec,fontWeight:600,pointerEvents:'none'}}>g</span>
              </div>
              <button onClick={()=>setGrams(grams+5)} style={{width:38,height:38,borderRadius:11,border:'none',background:'#007AFF',fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
            </div>
          </div>
        )}

        {/* Nutrition cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7,marginBottom:18}}>
          {[
            {l:'Kcal',   val:v(food.cal),        c:C.primary, unit:''},
            {l:'Prot',   val:v(food.prot),        c:C.red,     unit:'g'},
            {l:'Carbs',  val:v(food.carbs),       c:C.amber,   unit:'g'},
            {l:'Grasas', val:v(food.grasas),      c:C.purple,  unit:'g'},
            {l:'Fibra',  val:v(food.fibra),       c:C.green,   unit:'g'},
          ].map(({l,val,c,unit})=>(
            <div key={l} style={{background:C.surfaceAlt,borderRadius:14,padding:'12px 4px',textAlign:'center',border:`1.5px solid ${C.border}`}}>
              <div style={{fontSize:16,fontWeight:800,color:c,lineHeight:1}}>{val}{unit}</div>
              <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:'uppercase',marginTop:3,letterSpacing:.4}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Gram info banner */}
        <div style={{background:`${C.primary}10`,borderRadius:13,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:C.textSec,fontWeight:600}}>
            {mode==='porcion'?`1 porción = ${food.porcion||100}g`:`${grams}g seleccionados`}
          </span>
          <span style={{fontSize:13,fontWeight:800,color:C.primary}}>{v(food.cal)} kcal total</span>
        </div>

        <button onClick={()=>{onAdd({...food, grams: mode==='gramos'?grams:null}); haptic('add');}} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:'#007AFF',
          color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
        }}>Agregar {grams}g a {meal}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [splash,setSplash]     = useState(true);
  const [onboarded,setOnboarded] = useState(()=>{
    // Extra guard: if we have a nombre, treat as onboarded
    const ob = LS.get('onboarded',false);
    const nb = LS.get('nombre','');
    return ob || nb.length>0;
  });
  const [nombre,setNombre]     = useState(()=>LS.get('nombre',''));
  const [perfil,setPerfil]     = useState(()=>LS.get('perfil',{peso:70,altura:170,edad:25,sexo:'M',act:'1.55'}));
  const [obj,setObj]           = useState(()=>LS.get('obj','mantener'));
  const [dark,setDark]         = useState(()=>{
    const saved=LS.get('dark',null);
    if(saved!==null) return saved;
    const h=new Date().getHours();
    return h>=20||h<7; // auto dark 20:00–07:00
  });
  const [tab,setTab]           = useState(0);
  const [prevTab,setPrevTab]   = useState(0);
  const tabAnim = tab===prevTab?'anim':tab>prevTab?'anim-right':'anim-left';
  const goTab = (i) => { setPrevTab(tab); setTab(i); haptic('light'); };
  const [currentDay,setCurrentDay] = useState(()=>todayKey());
  const [toast,setToast]       = useState('');
  const [log,setLog]           = useState(()=>LS.get('log_'+todayKey(),[]) );
  const [agua,setAgua]         = useState(()=>LS.get('agua_'+todayKey(),0));
  const [meal,setMeal]         = useState('Desayuno');
  const [q,setQ]               = useState('');
  const [cat,setCat]           = useState('Todas');
  const [recent,setRecent]     = useState(()=>LS.get('recent',[]));
  const [weights,setWeights]   = useState(()=>LS.get('weights',[]));
  const [newWeight,setNewWeight] = useState('');
  const [streak,setStreak]     = useState(()=>LS.get('streak',{days:0,last:''}));
  const [expanded,setExpand]   = useState(null);
  const [detailFood,setDetail] = useState(null);
  const [exercises,setExercises] = useState(()=>LS.get('ex_'+todayKey(),[]));
  const [customFoods,setCustomFoods] = useState(()=>LS.get('customFoods',[]));
  const [favorites,setFavorites]   = useState(()=>LS.get('favorites',[]));
  const [dayNote,setDayNote]       = useState(()=>LS.get('note_'+todayKey(),''));
  const [weekData,setWeekData]     = useState([]);
  const [showExSheet,setShowEx]    = useState(false);
  const [showHistory,setShowHistory]   = useState(false);
  const [historyDay,setHistoryDay]     = useState(null);
  const [showWeekly,setShowWeekly]     = useState(false);
  const [showShare,setShowShare]       = useState(false);
  const [notifEnabled,setNotifEnabled] = useState(()=>LS.get('notif',false));
  const [searchSort,setSearchSort]     = useState('default');
  const [searchMaxCal,setSearchMaxCal] = useState(0);
  const [showSearchFilter,setShowSearchFilter] = useState(false);
  const [confetti,setConfetti]     = useState(false);
  const [lastPct,setLastPct]       = useState(0);
  const [showCustom,setShowCustom] = useState(false);
  const [showScanner,setShowScanner] = useState(false);
  const [showRecipe,setShowRecipe]   = useState(false);
  const [showPlanner,setShowPlanner] = useState(false);
  const [fastStart,setFastStart]   = useState(()=>LS.get('fastStart',null));
  const [fastGoal,setFastGoal]     = useState(()=>LS.get('fastGoal',16));
  const [fastNow,setFastNow]       = useState(Date.now());

  const C = dark ? DARK : LIGHT;

  /* ── persist ── */
  useEffect(()=>{LS.set('log_'+todayKey(),log);},[log]);
  useEffect(()=>{LS.set('agua_'+todayKey(),agua);},[agua]);
  useEffect(()=>{LS.set('perfil',perfil);},[perfil]);
  useEffect(()=>{LS.set('obj',obj);},[obj]);
  useEffect(()=>{LS.set('dark',dark);},[dark]);
  useEffect(()=>{LS.set('nombre',nombre);},[nombre]);
  useEffect(()=>{LS.set('recent',recent);},[recent]);
  useEffect(()=>{LS.set('weights',weights);},[weights]);

  /* ── streak ── */
  useEffect(()=>{
    if(log.length>0){
      const today=todayKey();
      if(streak.last!==today){
        const prev=new Date(today); prev.setDate(prev.getDate()-1);
        const prevKey=prev.toISOString().slice(0,10);
        const newDays=streak.last===prevKey?streak.days+1:1;
        const s={days:newDays,last:today};
        setStreak(s); LS.set('streak',s);
      }
    }
  },[log]);

  /* ── font + styles ── */
  useEffect(()=>{
    const link=document.createElement('link');
    link.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap';
    link.rel='stylesheet'; document.head.appendChild(link);
    const s=document.createElement('style');
    s.textContent=`
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
      ::-webkit-scrollbar{display:none;}
      body{margin:0;}

      /* ── Core entry animations ── */
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideInRight{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
      @keyframes slideInLeft{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}

      /* ── Spring physics ── */
      @keyframes springIn{
        0%{opacity:0;transform:scale(.5) translateY(20px)}
        60%{opacity:1;transform:scale(1.08) translateY(-4px)}
        80%{transform:scale(.97) translateY(2px)}
        100%{transform:scale(1) translateY(0)}
      }
      @keyframes springPop{
        0%{transform:scale(1)}
        30%{transform:scale(1.18)}
        60%{transform:scale(.94)}
        100%{transform:scale(1)}
      }
      @keyframes bounceIn{
        0%{opacity:0;transform:scale(.3)}
        50%{opacity:1;transform:scale(1.05)}
        70%{transform:scale(.95)}
        100%{transform:scale(1)}
      }

      /* ── Splash specific ── */
      @keyframes splashRingOut{from{opacity:.8;transform:scale(1)}to{opacity:0;transform:scale(2.8)}}
      @keyframes splashLogoIn{
        0%{opacity:0;transform:scale(.2) rotate(-10deg)}
        60%{opacity:1;transform:scale(1.12) rotate(3deg)}
        80%{transform:scale(.97) rotate(-1deg)}
        100%{transform:scale(1) rotate(0deg)}
      }
      @keyframes splashTextIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes splashBarFill{from{width:0}to{width:100%}}
      @keyframes splashFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.04)}}

      /* ── Stagger helpers ── */
      @keyframes staggerUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
      .s0{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .05s both}
      .s1{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .12s both}
      .s2{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .19s both}
      .s3{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .26s both}
      .s4{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .33s both}
      .s5{animation:staggerUp .4s cubic-bezier(.25,.46,.45,.94) .40s both}

      /* ── Micro-interactions ── */
      @keyframes addPop{0%{transform:scale(1)}40%{transform:scale(1.35)}70%{transform:scale(.9)}100%{transform:scale(1)}}
      @keyframes ripple{from{transform:scale(0);opacity:.6}to{transform:scale(4);opacity:0}}
      @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.8}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes goalCelebrate{0%{transform:scale(1)}25%{transform:scale(1.08) rotate(-2deg)}50%{transform:scale(1.12) rotate(2deg)}75%{transform:scale(1.06) rotate(-1deg)}100%{transform:scale(1) rotate(0)}}

      /* ── Confetti particles ── */
      @keyframes confettiDrop{
        0%{transform:translateY(-20px) rotate(0deg);opacity:1}
        100%{transform:translateY(120vh) rotate(720deg);opacity:0}
      }

      /* ── Tab transitions ── */
      .anim-right{animation:slideInRight .26s cubic-bezier(.25,.46,.45,.94) both}
      .anim-left{animation:slideInLeft .26s cubic-bezier(.25,.46,.45,.94) both}
      .anim{animation:fadeUp .26s cubic-bezier(.25,.46,.45,.94) both}
      .spring-in{animation:springIn .5s cubic-bezier(.25,.46,.45,.94) both}

      /* ── Tap feedback ── */
      .tap{transition:transform .1s cubic-bezier(.34,1.56,.64,1),opacity .1s ease;-webkit-user-select:none;user-select:none}
      .tap:active{opacity:.65;transform:scale(.93)}
      .nav-btn{transition:all .22s cubic-bezier(.34,1.56,.64,1)}
      .pop{animation:springPop .35s cubic-bezier(.34,1.56,.64,1)}
      .celebrate{animation:goalCelebrate .5s ease}
    `;
    document.head.appendChild(s);
  },[]);
  useEffect(()=>{document.body.style.background=C.bg;},[dark]);

  /* ── push notifications ── */
  useEffect(()=>{
    if(!notifEnabled) return;
    LS.set('notif',true);
    const scheduleReminders = async()=>{
      try {
        const perm = await Notification.requestPermission();
        if(perm!=='granted') return;
        // Schedule via Service Worker if available
        if('serviceWorker' in navigator && navigator.serviceWorker.controller){
          navigator.serviceWorker.controller.postMessage({type:'SCHEDULE_NOTIFS'});
        }
      } catch {}
    };
    scheduleReminders();

    // In-app reminders via intervals
    const checkReminders=()=>{
      const h=new Date().getHours(), m=new Date().getMinutes();
      const key=`notif_${new Date().toISOString().slice(0,10)}`;
      const sent=LS.get(key,{});
      if(h===9&&m<30&&!sent.breakfast&&log.filter(r=>r.comida==='Desayuno').length===0){
        setToast('🌅 ¿Ya registraste tu desayuno?');
        LS.set(key,{...sent,breakfast:true});
      }
      if(h===14&&m<30&&!sent.lunch&&log.filter(r=>r.comida==='Almuerzo').length===0){
        setToast('☀️ ¡Hora de registrar el almuerzo!');
        LS.set(key,{...sent,lunch:true});
      }
      if(h===21&&m<30&&!sent.dinner&&pct<0.5){
        setToast('🌙 Llevas pocas calorías hoy. ¿Olvidaste registrar algo?');
        LS.set(key,{...sent,dinner:true});
      }
    };
    const ti=setInterval(checkReminders,60000);
    checkReminders();
    return ()=>clearInterval(ti);
  },[notifEnabled, log, pct]);

  /* persist exercises + note */
  useEffect(()=>{LS.set('ex_'+todayKey(),exercises);},[exercises]);
  useEffect(()=>{LS.set('note_'+todayKey(),dayNote);},[dayNote]);
  useEffect(()=>{LS.set('customFoods',customFoods);},[customFoods]);
  useEffect(()=>{LS.set('favorites',favorites);},[favorites]);
  useEffect(()=>{LS.set('fastStart',fastStart);},[fastStart]);
  useEffect(()=>{LS.set('fastGoal',fastGoal);},[fastGoal]);
  useEffect(()=>{LS.set('notif',notifEnabled);},[notifEnabled]);

  /* fasting timer tick */
  useEffect(()=>{
    if(!fastStart) return;
    const ti=setInterval(()=>setFastNow(Date.now()),30000);
    return ()=>clearInterval(ti);
  },[fastStart]);

  /* weekly data loader */
  useEffect(()=>{
    const days=[];
    for(let i=6;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const key=d.toISOString().slice(0,10);
      const dayLog=LS.get('log_'+key,[]);
      const cal=Math.round(sumLog(dayLog).cal);
      days.push({date:key,cal,label:d.toLocaleDateString('es-CL',{weekday:'short'})});
    }
    setWeekData(days);
  },[tab]);

  /* ── auto dark/light by time ── */
  useEffect(()=>{
    const checkTime=()=>{
      const saved=LS.get('dark',null);
      if(saved===null){
        const h=new Date().getHours();
        setDark(h>=20||h<7);
      }
    };
    const ti=setInterval(checkTime,60000);
    return ()=>clearInterval(ti);
  },[]);

  /* ── day change: reset counters at midnight ── */
  useEffect(()=>{
    const checkDay=()=>{
      const today=todayKey();
      if(today!==currentDay){
        setCurrentDay(today);
        setLog(LS.get('log_'+today,[]));
        setAgua(LS.get('agua_'+today,0));
        setExercises(LS.get('ex_'+today,[]));
        setDayNote(LS.get('note_'+today,''));
        setFastStart(null); LS.set('fastStart',null);
        setStreak(LS.get('streak',{days:0,last:''}));
        setToast('¡Nuevo día! 🌅 Contadores reiniciados');
      }
    };
    const ti=setInterval(checkDay,30000);
    return ()=>clearInterval(ti);
  },[currentDay]);

  /* ── toast auto-dismiss ── */
  useEffect(()=>{
    if(toast){const t=setTimeout(()=>setToast(''),3200);return ()=>clearTimeout(t);}
  },[toast]);

  /* ── computed ── */
  const tdee   = calcTDEE(perfil);
  const metas  = calcMetas(tdee,obj);
  const tot    = useMemo(()=>sumLog(log),[log]);
  const pct    = metas.cal>0?tot.cal/metas.cal:0;
  const reste  = Math.max(0,metas.cal-Math.round(tot.cal));
  const sobre  = Math.round(tot.cal)-metas.cal;
  const ringR=50, ringC=2*Math.PI*ringR, ringPct=Math.min(pct,1);

  /* ── Goal celebration ── */
  useEffect(()=>{
    if(pct>=1 && lastPct<1 && tot.cal>0){
      setConfetti(true);
      haptic('goal');
      setTimeout(()=>setConfetti(false), 3000);
    }
    setLastPct(pct);
  },[pct]);
  const totalBurned = exercises.reduce((s,e)=>s+e.burn,0);
  const netCals = Math.round(tot.cal) - totalBurned;
  const allFoods = [...DB,...customFoods];
  const fastElapsed = fastStart ? Math.floor((fastNow-fastStart)/3600000) : 0;
  const tips = useMemo(()=>getTips({tot,metas,obj,agua,pct,exercises,streak}),
    // eslint-disable-next-line
    [tot.cal,tot.prot,metas.cal,obj,agua,pct,exercises.length,streak.days]);
  const fastPct = fastGoal>0 ? Math.min(fastElapsed/fastGoal,1) : 0;
  const fastDone = fastElapsed >= fastGoal;

  const foods  = useMemo(()=>{
    let list = allFoods.filter(a=>{
      const s=q.toLowerCase();
      return (a.nombre.toLowerCase().includes(s)||a.marca.toLowerCase().includes(s))&&(cat==='Todas'||a.cat===cat);
    });
    if(searchMaxCal>0) list=list.filter(a=>a.cal<=searchMaxCal);
    if(searchSort==='cal_asc')   list=[...list].sort((a,b)=>a.cal-b.cal);
    if(searchSort==='cal_desc')  list=[...list].sort((a,b)=>b.cal-a.cal);
    if(searchSort==='prot_desc') list=[...list].sort((a,b)=>b.prot-a.prot);
    if(searchSort==='name')      list=[...list].sort((a,b)=>a.nombre.localeCompare(b.nombre));
    return list;
  },[q,cat,allFoods,searchSort,searchMaxCal]);

  /* ── actions ── */
  const toggleFav = (food) => {
    const isFav=favorites.some(f=>f.id===food.id);
    if(isFav) setFavorites(favorites.filter(f=>f.id!==food.id));
    else setFavorites([...favorites,food].slice(0,20));
  };

  const addFood = useCallback((a)=>{
    const ex=log.find(r=>r.id===a.id&&r.comida===meal&&r.grams===(a.grams||null));
    if(ex) setLog(log.map(r=>r.uid===ex.uid?{...r,qty:r.qty+1}:r));
    else   setLog([...log,{...a,comida:meal,qty:1,uid:Date.now()+Math.random(),grams:a.grams||null}]);
    setRecent(prev=>{const f=prev.filter(x=>x.id!==a.id);return [a,...f].slice(0,8);});
    setDetail(null);
    haptic('add');
    setToast(`✓ ${a.nombre.split(' ').slice(0,3).join(' ')} agregado`);
  },[log,meal]);

  const adj=(uid,d)=>setLog(log.map(r=>r.uid===uid?{...r,qty:r.qty+d}:r).filter(r=>r.qty>0));
  const addWeight=()=>{
    if(!newWeight||isNaN(+newWeight)) return;
    const w={date:todayKey(),val:+newWeight};
    setWeights([...weights,w].slice(-30));
    setNewWeight('');
  };

  const hr=new Date().getHours();
  const SALUDO=hr<12?'Buenos días':hr<19?'Buenas tardes':'Buenas noches';
  const primerNombre=nombre.split(' ')[0];

  /* ── Stepper ── */
  const Stepper=({value,onDec,onInc})=>(
    <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
      <button onClick={onDec} style={{width:30,height:30,borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
      <span style={{fontSize:14,fontWeight:800,color:C.text,minWidth:22,textAlign:'center'}}>{value}</span>
      <button onClick={onInc} style={{width:30,height:30,borderRadius:9,border:'none',background:'#007AFF',color:'white',fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
    </div>
  );

  /* ════════════ RENDER ════════════ */
  if(splash) return <Splash onDone={()=>setSplash(false)}/>;
  if(!onboarded) return <Onboarding onDone={({nombre:n,perfil:p,obj:o})=>{
    setNombre(n); setPerfil(p); setObj(o);
    setOnboarded(true); LS.set('onboarded',true);
    LS.set('nombre',n); LS.set('perfil',p); LS.set('obj',o);
  }}/>;

  return (
    <div style={{fontFamily:F,minHeight:'100vh',background:C.bg,paddingBottom:88,transition:'background .3s'}}>

      {/* ══ FOOD DETAIL MODAL ══ */}
      {detailFood&&(
        <ModalDetalle food={detailFood} meal={meal} C={C} F={F}
          onClose={()=>setDetail(null)} onAdd={addFood}
          onFav={()=>toggleFav(detailFood)}
          isFav={favorites.some(f=>f.id===detailFood?.id)}/>
      )}

      {/* ══ WEEKLY SUMMARY ══ */}
      {showWeekly&&<WeeklySummary C={C} F={F} metas={metas} streak={streak} onClose={()=>setShowWeekly(false)}/>}

      {/* ══ SHARE CARD ══ */}
      {showShare&&<ShareCard C={C} F={F} nombre={nombre} tot={tot} metas={metas} obj={obj} streak={streak} exercises={exercises} onClose={()=>setShowShare(false)}/>}

      {/* ══ HISTORY MODAL ══ */}
      {showHistory&&(
        <div style={{position:'fixed',inset:0,background:C.bg,zIndex:80,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
          <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            <button onClick={()=>setShowHistory(false)} style={{background:'none',border:'none',fontSize:16,cursor:'pointer',color:'#007AFF',fontFamily:F,fontWeight:600,padding:4}}>← Volver</button>
            <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📅 Historial</div>
            <div style={{width:60}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
            {Array.from({length:14},(_,i)=>{
              const d=new Date(); d.setDate(d.getDate()-1-i);
              const key=d.toISOString().slice(0,10);
              const dayLog=LS.get('log_'+key,[]);
              const cal=Math.round(sumLog(dayLog).cal);
              const note=LS.get('note_'+key,'');
              const exs=LS.get('ex_'+key,[]);
              const isSelected=historyDay===key;
              return(
                <div key={key} style={{marginBottom:8}}>
                  <div onClick={()=>setHistoryDay(isSelected?null:key)} style={{
                    background:C.surface,borderRadius:18,padding:'14px 16px',
                    border:`1px solid ${isSelected?'#007AFF':C.border}`,
                    cursor:'pointer',transition:'all .2s',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:13,
                        background:cal>0?'#007AFF18':'#F2F2F7',
                        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:800,color:cal>0?'#007AFF':C.textMuted}}>{d.getDate()}</div>
                        <div style={{fontSize:8,color:cal>0?'#007AFF':C.textMuted,fontWeight:600,textTransform:'uppercase'}}>
                          {d.toLocaleDateString('es-CL',{month:'short'})}
                        </div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,textTransform:'capitalize'}}>
                          {d.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}
                        </div>
                        <div style={{display:'flex',gap:8,marginTop:4,flexWrap:'wrap'}}>
                          {cal>0?<span style={{fontSize:11,fontWeight:700,color:'#007AFF'}}>{cal} kcal</span>
                            :<span style={{fontSize:11,color:C.textMuted}}>Sin registro</span>}
                          {exs.length>0&&<span style={{fontSize:11,color:'#34C759',fontWeight:600}}>💪 {exs.length} ejercicio{exs.length>1?'s':''}</span>}
                          {note&&<span style={{fontSize:11,color:C.textSec}}>📝 Nota</span>}
                        </div>
                      </div>
                      <div style={{fontSize:14,color:C.textMuted,transition:'transform .2s',transform:isSelected?'rotate(180deg)':'rotate(0)'}}>▾</div>
                    </div>

                    {/* Expanded detail */}
                    {isSelected&&dayLog.length>0&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,animation:'fadeUp .2s ease'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                          {[{l:'Kcal',v:Math.round(sumLog(dayLog).cal)},{l:'Prot',v:`${Math.round(sumLog(dayLog).prot)}g`},{l:'Carbs',v:`${Math.round(sumLog(dayLog).carbs)}g`},{l:'Grasas',v:`${Math.round(sumLog(dayLog).grasas)}g`}].map(({l,v})=>(
                            <div key={l} style={{textAlign:'center'}}>
                              <div style={{fontSize:14,fontWeight:800,color:C.text}}>{v}</div>
                              <div style={{fontSize:9,color:C.textMuted,textTransform:'uppercase',fontWeight:600,marginTop:1}}>{l}</div>
                            </div>
                          ))}
                        </div>
                        {['Desayuno','Almuerzo','Once','Cena','Snack'].map(m=>{
                          const items=dayLog.filter(r=>r.comida===m);
                          if(!items.length) return null;
                          return(
                            <div key={m} style={{marginBottom:8}}>
                              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:4}}>{MI[m]} {m}</div>
                              {items.map((item,ii)=>(
                                <div key={ii} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                                  <span style={{fontSize:16}}>{item.emoji}</span>
                                  <div style={{flex:1,fontSize:12,color:C.text,fontWeight:500}}>{item.nombre}</div>
                                  <span style={{fontSize:11,fontWeight:700,color:C.textSec}}>{Math.round(item.cal*(item.grams?item.grams/(item.porcion||100):1)*item.qty)} kcal</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {note&&<div style={{marginTop:8,padding:'10px 12px',background:C.surfaceAlt,borderRadius:12,fontSize:12,color:C.textSec,fontStyle:'italic'}}>📝 {note}</div>}
                        {/* Copy to today button */}
                        <button className="tap" onClick={()=>{
                          setLog(dayLog.map(item=>({...item,uid:Date.now()+Math.random()})));
                          setShowHistory(false);
                          haptic('success');
                          setToast('¡Comidas copiadas al día de hoy! 📋');
                        }} style={{
                          width:'100%',marginTop:12,padding:'11px',borderRadius:14,
                          border:'none',background:'#007AFF',color:'white',
                          fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,
                        }}>📋 Copiar estas comidas a hoy</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ CONFETTI ══ */}
      <Confetti active={confetti}/>

      {/* ══ BARCODE SCANNER ══ */}
      {showScanner&&<BarcodeScanner C={C} F={F} onClose={()=>setShowScanner(false)} onFound={(food)=>{
                setShowScanner(false);
                // Small delay so camera stream stops before modal mounts
                setTimeout(()=>setDetail(food), 200);
              }}/>}

      {/* ══ RECIPE BUILDER ══ */}
      {showRecipe&&<RecipeBuilder C={C} F={F} allFoods={allFoods} onClose={()=>setShowRecipe(false)} onSave={(r)=>{setCustomFoods([...customFoods,r]);setShowRecipe(false);}}/>}

      {/* ══ WEEKLY PLANNER ══ */}
      {showPlanner&&<WeeklyPlanner C={C} F={F} allFoods={allFoods} onClose={()=>setShowPlanner(false)}/>}

      {/* ══ EXERCISE SHEET ══ */}
      {showExSheet&&<ExerciseSheet C={C} F={F} perfil={perfil} onClose={()=>setShowEx(false)} onAdd={(ex)=>{setExercises([...exercises,ex]);setShowEx(false);}}/>}

      {/* ══ CUSTOM FOOD SHEET ══ */}
      {showCustom&&<CustomFoodSheet C={C} F={F} onClose={()=>setShowCustom(false)} onSave={(f)=>{setCustomFoods([...customFoods,f]);setShowCustom(false);}}/>}

      {/* ══ HEADER ══ */}
      <div style={{
        background:C.headerBg,
        borderBottom:`1px solid ${C.border}`,
        padding:'12px 18px 10px',
        position:'sticky',top:0,zIndex:20,
        backdropFilter:'blur(20px)',
        transition:'background .3s',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Logo size={34}/>
            <div>
              <div style={{color:C.text,fontSize:18,fontWeight:800,letterSpacing:'-.6px',lineHeight:1}}>Calorú</div>
              <div style={{color:C.textSec,fontSize:10,fontWeight:500,marginTop:1}}>
                {new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'short'})}
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{textAlign:'right'}}>
              <div style={{color:C.text,fontSize:15,fontWeight:800,lineHeight:1}}>
                {Math.round(tot.cal)}<span style={{fontSize:11,color:C.textSec,fontWeight:500}}> / {metas.cal} kcal</span>
              </div>
              <div style={{color:tot.cal>metas.cal?C.red:C.textSec,fontSize:10,fontWeight:600,marginTop:1}}>
                {tot.cal>metas.cal?`+${sobre} excedido`:`${reste} restantes`}
              </div>
            </div>
            <button className="tap" onClick={()=>{const nd=!dark;setDark(nd);LS.set('dark',nd);}} style={{
              width:34,height:34,borderRadius:10,
              border:`1px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,
              fontSize:15,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            }}>
              {dark?'☀️':'🌙'}
            </button>
          </div>
        </div>
        {/* thin progress bar */}
        <div style={{height:3,background:C.border,borderRadius:3,overflow:'hidden'}}>
          <div style={{
            height:'100%',
            width:`${Math.min(pct*100,100)}%`,
            background:tot.cal>metas.cal?C.red:C.accent,
            borderRadius:3,transition:'width .8s cubic-bezier(.25,.46,.45,.94)',
          }}/>
        </div>
      </div>

      <div style={{padding:'14px 14px 0'}}>

        {/* ══════════════════════════════════
            TAB 0 — INICIO
        ══════════════════════════════════ */}
        {tab===0&&<div className={tabAnim}>

          {/* Saludo */}
          <div style={{marginBottom:14,animation:'splashTextIn .5s ease both'}}>
            <div style={{fontSize:26,fontWeight:800,color:C.text,letterSpacing:'-.8px',lineHeight:1.1}}>{SALUDO}, {primerNombre} 👋</div>
            <div style={{fontSize:14,color:C.textSec,fontWeight:400,marginTop:4}}>
              {pct===0?'¿Qué vas a comer hoy?':pct<.5?'¡Buen comienzo!':pct<.9?'¡Vas muy bien! 🌿':'¡Casi en tu meta! 🎯'}
            </div>
          </div>

          {/* ── STREAK + LOGROS ── */}
          <div className="s0" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:14,scrollbarWidth:'none'}}>
            {/* Racha */}
            <div style={{flexShrink:0,borderRadius:18,padding:'10px 14px',display:'flex',alignItems:'center',gap:9,
              background:streak.days>0?C.surface:C.surfaceAlt,
              border:`1px solid ${streak.days>0?C.red+'40':C.border}`,
              boxShadow:'none',
            }}>
              <span style={{fontSize:22}}>🔥</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:streak.days>0?C.red:C.text,lineHeight:1}}>{streak.days} día{streak.days!==1?'s':''} seguidos</div>
                <div style={{fontSize:10,color:C.textSec,fontWeight:400,marginTop:1}}>Racha actual</div>
              </div>
            </div>
            {/* Meta del día */}
            <div style={{flexShrink:0,background:C.surface,borderRadius:18,padding:'10px 14px',display:'flex',alignItems:'center',gap:9,border:`1.5px solid ${C.border}`}}>
              <div style={{width:34,height:34,borderRadius:10,background:`${C.primary}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🎯</div>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:C.text,lineHeight:1}}>{Math.round(pct*100)}% de meta</div>
                <div style={{fontSize:10,color:C.textSec,fontWeight:500,marginTop:1}}>{metas.cal} kcal / día</div>
              </div>
            </div>
            {/* Agua */}
            {agua>=8&&<div style={{flexShrink:0,background:'linear-gradient(135deg,#3A8FC8,#5AAEE0)',borderRadius:18,padding:'10px 14px',display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 14px rgba(58,143,200,0.4)'}}>
              <span style={{fontSize:20}}>💧</span>
              <div style={{fontSize:12,fontWeight:800,color:'white',lineHeight:1}}>Hidratado</div>
            </div>}
            {/* Día completo */}
            {MEALS.every(m=>log.some(r=>r.comida===m))&&<div style={{flexShrink:0,background:`linear-gradient(135deg,${C.green},#3D8A59)`,borderRadius:18,padding:'10px 14px',display:'flex',alignItems:'center',gap:8,boxShadow:`0 4px 14px ${C.green}40`}}>
              <span style={{fontSize:20}}>✅</span>
              <div style={{fontSize:12,fontWeight:800,color:'white',lineHeight:1}}>Día completo</div>
            </div>}
          </div>

          {/* ── TIPS NUTRICIONALES ── */}
          {tips.length>0&&(
            <div className="s1" style={{marginBottom:12}}>
              {tips.map((tip,i)=>(
                <div key={tip.key} style={{
                  display:'flex',alignItems:'center',gap:10,
                  background:C.surface,borderRadius:16,padding:'11px 14px',
                  marginBottom:i<tips.length-1?7:0,
                  border:`1px solid ${tip.color}30`,
                  borderLeft:`3px solid ${tip.color}`,
                  animation:`staggerUp .4s ease ${i*.1}s both`,
                }}>
                  <span style={{fontSize:20,flexShrink:0}}>{tip.icon}</span>
                  <div style={{fontSize:12,color:C.text,fontWeight:500,lineHeight:1.4}}>{tip.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── CALORIE RING HERO ── */}
          <div className="s1" style={{
            background:C.surface,
            borderRadius:24,padding:'20px',marginBottom:12,
            border:`1px solid ${C.border}`,
            boxShadow:dark?'none':'0 2px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              {/* Ring */}
              <div style={{flexShrink:0,position:'relative',width:120,height:120}}>
                <svg width={120} height={120} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={ringR} fill="none" stroke={C.border} strokeWidth={11}/>
                  <circle cx={60} cy={60} r={ringR} fill="none"
                    stroke={tot.cal>metas.cal?C.red:C.accent} strokeWidth={11}
                    strokeDasharray={`${ringPct*ringC} ${ringC}`} strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{transition:'stroke-dasharray 1s cubic-bezier(.34,1.56,.64,1)',filter:pct>=1?'drop-shadow(0 0 6px rgba(52,199,89,0.8))':'none'}}/>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:8,color:C.textSec,fontWeight:600,textTransform:'uppercase',letterSpacing:.8}}>
                    {tot.cal>metas.cal?'Exceso':'Libres'}
                  </div>
                  <div style={{fontSize:24,fontWeight:800,color:tot.cal>metas.cal?C.red:C.text,lineHeight:1.1,marginTop:1}}>
                    {tot.cal>metas.cal?sobre:reste}
                  </div>
                  <div style={{fontSize:8,color:C.textSec,fontWeight:500}}>kcal</div>
                </div>
              </div>
              {/* Stats */}
              <div style={{flex:1}}>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:C.textSec,fontWeight:500}}>Consumido hoy</div>
                  <div style={{fontSize:28,fontWeight:800,color:C.text,lineHeight:1.1,letterSpacing:'-.5px'}}>
                    {Math.round(tot.cal)}<span style={{fontSize:13,color:C.textSec,fontWeight:500}}> kcal</span>
                  </div>
                </div>
                {[{l:'Prot',v:tot.prot,m:metas.prot,c:C.red},{l:'Carbs',v:tot.carbs,m:metas.carbs,c:C.amber},{l:'Grasas',v:tot.grasas,m:metas.grasas,c:C.purple}].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:10,color:C.textSec,fontWeight:500}}>{l}</span>
                      <span style={{fontSize:10,color:C.text,fontWeight:700}}>{Math.round(v)}<span style={{color:C.textMuted,fontWeight:400}}>/{m}g</span></span>
                    </div>
                    <div style={{height:3,background:C.border,borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:3,transition:'width .6s cubic-bezier(.25,.46,.45,.94)'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 4 MACRO CARDS ── */}
          <div className="s2" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
            {[
              {k:'prot',  lS:'Prot',   c:C.red},
              {k:'carbs', lS:'Carbs',  c:C.amber},
              {k:'grasas',lS:'Grasas', c:C.purple},
              {k:'fibra', lS:'Fibra',  c:C.green},
            ].map(({k,lS,c2=null,c})=>{
              const v=tot[k], m=k==='fibra'?25:metas[k], p2=m>0?Math.min(v/m*100,100):0;
              return (
                <div key={k} style={{
                  background:C.surface,borderRadius:18,
                  border:`1px solid ${C.border}`,
                  overflow:'hidden',
                  boxShadow:dark?'none':'0 1px 8px rgba(0,0,0,0.05)',
                }}>
                  {/* color top bar */}
                  <div style={{height:3,background:C.border}}>
                    <div style={{height:'100%',width:`${p2}%`,background:c,transition:'width .7s cubic-bezier(.25,.46,.45,.94)'}}/>
                  </div>
                  <div style={{padding:'10px 8px 10px',textAlign:'center'}}>
                    <div style={{fontSize:20,fontWeight:800,color:C.text,lineHeight:1,letterSpacing:'-.5px'}}>{Math.round(v)}</div>
                    <div style={{fontSize:8,color:C.textMuted,fontWeight:500,marginBottom:4}}>/{m}g</div>
                    <div style={{fontSize:9,color:c,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{lS}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── WATER TRACKER ── */}
          <div className="s3" style={{
            background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:12,
            border:`1px solid ${C.border}`,
            boxShadow:dark?'none':'0 1px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:22}}>💧</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>Hidratación</div>
                  <div style={{fontSize:11,color:C.textSec,fontWeight:400,marginTop:1}}>
                    {agua===8?'¡Meta cumplida! 🎉':`${agua} de 8 vasos`}
                  </div>
                </div>
              </div>
              <div style={{
                background:'#007AFF18',borderRadius:12,padding:'5px 12px',
                display:'flex',alignItems:'baseline',gap:2,
              }}>
                <span style={{fontSize:20,fontWeight:800,color:'#007AFF'}}>{agua}</span>
                <span style={{fontSize:11,color:'#007AFF',fontWeight:500,opacity:.6}}>/8</span>
              </div>
            </div>
            <div style={{display:'flex',gap:4}}>
              {Array.from({length:8}).map((_,i)=>(
                <button key={i} className="tap" onClick={()=>{setAgua(i<agua?i:i+1);haptic('light');}} style={{
                  flex:1,height:36,borderRadius:8,border:'none',cursor:'pointer',
                  background:i<agua?'#007AFF':'#007AFF18',
                  transition:'all .2s cubic-bezier(.25,.46,.45,.94)',
                  padding:0,
                }}/>
              ))}
            </div>
          </div>

          {/* ── EJERCICIO WIDGET ── */}
          <div className="s4" style={{background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 1px 6px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:exercises.length>0?12:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:22}}>🏃</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>Ejercicio hoy</div>
                  {totalBurned>0&&<div style={{fontSize:11,color:'#34C759',fontWeight:600,marginTop:1}}>−{totalBurned} kcal quemadas · Neto: {netCals} kcal</div>}
                  {totalBurned===0&&<div style={{fontSize:11,color:C.textSec,fontWeight:400,marginTop:1}}>Sin ejercicio registrado</div>}
                </div>
              </div>
              <button className="tap" onClick={()=>setShowEx(true)} style={{width:34,height:34,borderRadius:10,border:'none',background:'#34C75918',color:'#34C759',fontSize:20,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
            {exercises.length>0&&(
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {exercises.map(ex=>(
                  <div key={ex.uid} style={{display:'flex',alignItems:'center',gap:10,background:'#34C75910',borderRadius:12,padding:'8px 12px'}}>
                    <span style={{fontSize:18}}>{ex.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{ex.nombre}</div>
                      <div style={{fontSize:10,color:C.textSec}}>{ex.mins} min</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:'#34C759'}}>−{ex.burn} kcal</span>
                    <button onClick={()=>setExercises(exercises.filter(e=>e.uid!==ex.uid))} style={{background:'none',border:'none',color:C.textMuted,fontSize:14,cursor:'pointer',padding:2}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── AYUNO INTERMITENTE ── */}
          <div style={{background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 1px 6px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:fastStart?12:0}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:22}}>⏱️</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>Ayuno intermitente</div>
                  <div style={{fontSize:11,color:C.textSec,fontWeight:400,marginTop:1}}>
                    {fastStart?`${fastElapsed}h ${Math.floor(((fastNow-fastStart)%3600000)/60000)}min de ${fastGoal}h`:'Sin ayuno activo'}
                  </div>
                </div>
              </div>
              <button className="tap" onClick={()=>{if(fastStart){setFastStart(null);}else{setFastStart(Date.now());}}} style={{
                padding:'6px 14px',borderRadius:20,border:'none',fontFamily:F,
                background:fastStart?(fastDone?'#34C759':'#FF9500'):'#1C1C1E',
                color:'white',fontSize:12,fontWeight:700,cursor:'pointer',
              }}>{fastStart?(fastDone?'✅ Listo':'Detener'):'Iniciar'}</button>
            </div>
            {fastStart&&(
              <>
                <div style={{display:'flex',gap:6,marginBottom:10}}>
                  {[12,14,16,18,20,24].map(h=>(
                    <button key={h} onClick={()=>setFastGoal(h)} style={{flex:1,padding:'5px 2px',borderRadius:10,border:`1.5px solid ${fastGoal===h?'#FF9500':C.border}`,background:fastGoal===h?'#FF950014':C.surfaceAlt,color:fastGoal===h?'#FF9500':C.textSec,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>{h}h</button>
                  ))}
                </div>
                <div style={{height:6,background:C.border,borderRadius:6,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${fastPct*100}%`,background:fastDone?'#34C759':'#FF9500',borderRadius:6,transition:'width .5s ease'}}/>
                </div>
              </>
            )}
          </div>

          {/* ── NOTA DEL DÍA ── */}
          <div style={{background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 1px 6px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <span style={{fontSize:20}}>📝</span>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>Nota del día</div>
            </div>
            <textarea value={dayNote} onChange={e=>setDayNote(e.target.value)}
              placeholder="¿Cómo te sientes hoy? Escribe algo..."
              style={{width:'100%',minHeight:70,padding:'10px 12px',border:`1px solid ${C.border}`,borderRadius:13,fontSize:13,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',resize:'none',lineHeight:1.5}}/>
          </div>

          {/* ── SUGERENCIAS RÁPIDAS (Home) ── */}
          <div className="s5" style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,letterSpacing:'-.3px'}}>💡 Sugerido para ti</div>
              <button className="tap" onClick={()=>goTab(1)} style={{fontSize:12,color:'#007AFF',background:'none',border:'none',cursor:'pointer',fontFamily:F,fontWeight:600}}>Ver más →</button>
            </div>
            {(()=>{
              const sug=SUGGESTIONS[obj]||SUGGESTIONS.mantener;
              const hr=new Date().getHours();
              const timeKey=hr<10?'desayuno':hr<14?'almuerzo':hr<18?'once':hr<21?'cena':'snack';
              const sugIds=TIME_SUGGESTIONS[timeKey].ids;
              const foods=sugIds.map(id=>allFoods.find(f=>f.id===id)).filter(Boolean).slice(0,5);
              return(
                <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                  {foods.map(food=>(
                    <button key={food.id} className="tap" onClick={()=>{haptic('light');setMeal(meal);setDetail(food);goTab(1);}} style={{
                      flexShrink:0,background:C.surface,border:`1px solid ${C.border}`,
                      borderRadius:18,padding:'12px 10px',textAlign:'center',
                      cursor:'pointer',fontFamily:F,minWidth:76,
                    }}>
                      <div style={{fontSize:26,marginBottom:5}}>{food.emoji}</div>
                      <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.2,
                        maxWidth:70,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',margin:'0 auto'}}>
                        {food.nombre.split(' ').slice(0,2).join(' ')}
                      </div>
                      <div style={{fontSize:10,fontWeight:800,color:sug.color,marginTop:3}}>{food.cal} kcal</div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* ── MEAL CARDS ── */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:12,letterSpacing:'-.3px'}}>Comidas de hoy</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {MEALS.map(m=>{
                const items=log.filter(r=>r.comida===m);
                const cal=items.reduce((s,r)=>s+r.cal*r.qty,0);
                const p2=metas.cal>0?Math.min(cal/metas.cal*100,100):0;
                const has=items.length>0;
                return (
                  <div key={m} style={{borderRadius:18,overflow:'hidden',background:C.surface,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 1px 6px rgba(0,0,0,0.04)',transition:'all .25s ease'}}>
                    <div style={{background:has?`linear-gradient(135deg,${MC[m]},${MC[m]}CC)`:`${C.surfaceAlt}`,padding:'11px 14px',display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:42,height:42,borderRadius:13,background:has?'rgba(255,255,255,0.2)':C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{MI[m]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:800,color:has?'white':C.text,lineHeight:1}}>{m}</div>
                        <div style={{fontSize:11,color:has?'rgba(255,255,255,0.65)':C.textMuted,fontWeight:500,marginTop:1}}>{has?`${items.length} alimento${items.length>1?'s':''}`:' Vacío'}</div>
                      </div>
                      {has
                        ?<div style={{background:'rgba(255,255,255,0.2)',borderRadius:12,padding:'5px 10px',textAlign:'center'}}>
                          <div style={{fontSize:14,fontWeight:800,color:'white',lineHeight:1}}>{Math.round(cal)}</div>
                          <div style={{fontSize:8,color:'rgba(255,255,255,0.65)'}}>kcal</div>
                         </div>
                        :<button className="tap" onClick={()=>{setMeal(m);setTab(1);}} style={{width:34,height:34,borderRadius:11,border:`1.5px solid ${C.border}`,background:C.surface,color:C.textMuted,fontSize:20,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
                      }
                    </div>
                    {has&&(
                      <div style={{background:C.surface,padding:'8px 14px 10px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                          <span style={{fontSize:10,color:C.textSec,fontWeight:600}}>{Math.round(p2)}% de tu meta diaria</span>
                          <span style={{fontSize:10,color:C.textSec,fontWeight:600}}>P:{Math.round(items.reduce((s,r)=>s+r.prot*r.qty,0))}g C:{Math.round(items.reduce((s,r)=>s+r.carbs*r.qty,0))}g</span>
                        </div>
                        <div style={{height:4,background:C.surfaceAlt,borderRadius:4,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${p2}%`,background:`linear-gradient(90deg,${MC[m]}99,${MC[m]})`,borderRadius:4,transition:'width .5s'}}/>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>}

        {/* ══════════════════════════════════
            TAB 1 — AGREGAR
        ══════════════════════════════════ */}
        {tab===1&&<div className={tabAnim}>
          {/* Meal selector */}
          <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:4,marginBottom:14,scrollbarWidth:'none'}}>
            {MEALS.map(m=>(
              <button key={m} className="tap" onClick={()=>setMeal(m)} style={{
                flexShrink:0,display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:20,border:'none',fontFamily:F,
                background:meal===m?MC[m]:C.surfaceAlt,
                color:meal===m?'#FFFFFF':C.textSec,
                fontSize:13,fontWeight:meal===m?700:500,cursor:'pointer',
                boxShadow:'none',
                transition:'all .2s',
              }}>{MI[m]} {m}</button>
            ))}
          </div>

          {/* Search + Filter */}
          <div style={{display:'flex',gap:8,marginBottom:10}}>
          <div style={{position:'relative',flex:1}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:.35,pointerEvents:'none'}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto o marca..."
              style={{width:'100%',padding:'12px 40px 12px 42px',border:`1.5px solid ${q?C.primary:C.border}`,borderRadius:16,background:C.surface,fontSize:14,fontFamily:F,color:C.text,outline:'none',fontWeight:500,transition:'border-color .2s'}}/>
            {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',fontSize:20,cursor:'pointer',color:C.textMuted,lineHeight:1}}>×</button>}
          </div>
          <button className="tap" onClick={()=>setShowSearchFilter(!showSearchFilter)} style={{
            width:46,height:46,borderRadius:14,flexShrink:0,
            border:`1.5px solid ${(searchSort!=='default'||searchMaxCal>0)?'#007AFF':C.border}`,
            background:(searchSort!=='default'||searchMaxCal>0)?'#007AFF18':C.surfaceAlt,
            display:'flex',alignItems:'center',justifyContent:'center',
            color:(searchSort!=='default'||searchMaxCal>0)?'#007AFF':C.textSec,
            fontSize:18,cursor:'pointer',
          }}>⚙️</button>
          </div>

          {/* Filter panel */}
          {showSearchFilter&&(
            <div style={{background:C.surface,borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1px solid ${C.border}`,animation:'fadeUp .2s ease'}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Ordenar por</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                {[{v:'default',l:'Relevancia'},{v:'cal_asc',l:'Menos kcal'},{v:'cal_desc',l:'Más kcal'},{v:'prot_desc',l:'Más proteína'},{v:'name',l:'A-Z'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setSearchSort(v)} style={{
                    padding:'6px 12px',borderRadius:12,border:'none',
                    background:searchSort===v?'#007AFF':C.surfaceAlt,
                    color:searchSort===v?'white':C.textSec,
                    fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F,
                  }}>{l}</button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Máximo de calorías</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[0,100,200,300,500].map(v=>(
                  <button key={v} className="tap" onClick={()=>setSearchMaxCal(v)} style={{
                    padding:'6px 12px',borderRadius:12,border:'none',
                    background:searchMaxCal===v?'#007AFF':C.surfaceAlt,
                    color:searchMaxCal===v?'white':C.textSec,
                    fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F,
                  }}>{v===0?'Sin límite':`≤${v}`}</button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:10,scrollbarWidth:'none'}}>
            {CATS.map(c=>(
              <button key={c} className="tap" onClick={()=>setCat(c)} style={{
                flexShrink:0,padding:'6px 14px',borderRadius:20,
                border:cat===c?'none':`1px solid ${C.border}`,
                background:cat===c?'#007AFF':C.surfaceAlt,
                color:cat===c?'#FFFFFF':C.textSec,
                fontSize:12,fontWeight:cat===c?700:500,
                cursor:'pointer',fontFamily:F,
                transition:'all .18s ease',
              }}>{c}</button>
            ))}
          </div>

          {/* Favoritos */}
          {favorites.length>0&&!q&&(
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5}}>⭐ Favoritos</div>
              </div>
              <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                {favorites.map(a=>(
                  <button key={a.id} className="tap" onClick={()=>setDetail(a)} style={{flexShrink:0,background:C.surface,border:`1px solid #FF950040`,borderRadius:16,padding:'10px 12px',textAlign:'center',cursor:'pointer',fontFamily:F,minWidth:72,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
                    <div style={{fontSize:22,marginBottom:4}}>{a.emoji}</div>
                    <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.2,maxWidth:68,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nombre.split(' ').slice(0,2).join(' ')}</div>
                    <div style={{fontSize:10,fontWeight:800,color:'#FF9500',marginTop:2}}>{a.cal}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recientes */}
          {!q&&recent.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textSec,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>🕐 Recientes</div>
              <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                {recent.map(a=>(
                  <button key={a.id} className="tap" onClick={()=>setDetail(a)} style={{flexShrink:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:'10px 12px',textAlign:'center',cursor:'pointer',fontFamily:F,minWidth:72}}>
                    <div style={{fontSize:22,marginBottom:4}}>{a.emoji}</div>
                    <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.2,maxWidth:68,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nombre.split(' ').slice(0,2).join(' ')}</div>
                    <div style={{fontSize:10,fontWeight:800,color:'#007AFF',marginTop:2}}>{a.cal}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            <button className="tap" onClick={()=>setShowScanner(true)} style={{
              padding:'12px',borderRadius:16,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,
              fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>📷</span> Escanear código
            </button>
            <button className="tap" onClick={()=>setShowRecipe(true)} style={{
              padding:'12px',borderRadius:16,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,
              fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>👨‍🍳</span> Crear receta
            </button>
            <button className="tap" onClick={()=>setShowCustom(true)} style={{
              padding:'12px',borderRadius:16,
              border:`1.5px dashed ${C.border}`,
              background:C.surfaceAlt,color:C.textSec,
              fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>✨</span> Alimento propio
            </button>
            <button className="tap" onClick={()=>setShowPlanner(true)} style={{
              padding:'12px',borderRadius:16,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,
              fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>🗓️</span> Plan semanal
            </button>
          </div>

          {/* Sugerencias por objetivo */}
          {!q&&<SuggestionsPanel obj={obj} meal={meal} C={C} F={F} allFoods={allFoods} onSelect={(food)=>{haptic('light');setDetail(food);}}/>}

          <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:10}}>{foods.length} productos</div>

          {/* Food list */}
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {foods.length===0&&<div style={{textAlign:'center',padding:'50px 0'}}>
              <div style={{fontSize:36,marginBottom:10}}>🤷</div>
              <div style={{fontSize:14,fontWeight:700,color:C.textSec}}>Sin resultados para "{q}"</div>
            </div>}
            {foods.map(a=>{
              const inLog=log.find(r=>r.id===a.id&&r.comida===meal);
              return (
                <div key={a.id} onClick={()=>setDetail(a)} style={{
                  display:'flex',alignItems:'center',gap:12,
                  background:C.surface,borderRadius:16,padding:'12px 14px',
                  border:`1px solid ${inLog?MC[meal]+'80':C.border}`,
                  boxShadow:'none',
                  cursor:'pointer',transition:'all .2s',
                }}>
                  <div style={{width:46,height:46,borderRadius:14,background:inLog?`${MC[meal]}14`:C.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{a.emoji}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.nombre}</div>
                    <div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginTop:1}}>{a.marca} · {a.cat}</div>
                    <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.primary}}>{a.cal} kcal</span>
                      {[{k:'prot',c:C.red},{k:'carbs',c:C.amber},{k:'grasas',c:C.purple}].map(({k,c})=>(
                        <span key={k} style={{fontSize:10,fontWeight:700,color:c,background:`${c}18`,padding:'1px 6px',borderRadius:6}}>{k[0].toUpperCase()}:{a[k]}g</span>
                      ))}
                    </div>
                  </div>
                  <div style={{
                    width:36,height:36,borderRadius:11,
                    background:inLog?MC[meal]:'#007AFF',
                    color:'white',
                    fontSize:20,fontWeight:700,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    flexShrink:0,
                    transition:'all .2s',
                  }}>
                    {inLog?'✓':'+'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* ══════════════════════════════════
            TAB 2 — MI DÍA
        ══════════════════════════════════ */}
        {tab===2&&<div className={tabAnim}>
          {/* Summary hero */}
          <div style={{background:C.surface,borderRadius:24,padding:'18px',marginBottom:14,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 2px 16px rgba(0,0,0,0.06)'}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Resumen del día</div>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <DonutChart prot={tot.prot} carbs={tot.carbs} grasas={tot.grasas} total={tot.cal} size={130} C2={{
                border:dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)',
                textMuted:dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.35)',
                text:dark?'#FFFFFF':'#000000',
                red:C.red, amber:C.amber, purple:C.purple,
              }}/>
              <div style={{flex:1}}>
                {[
                  {l:'Proteínas',v:Math.round(tot.prot),m:metas.prot,c:C.red},
                  {l:'Carbohidratos',v:Math.round(tot.carbs),m:metas.carbs,c:C.amber},
                  {l:'Grasas',v:Math.round(tot.grasas),m:metas.grasas,c:C.purple},
                  {l:'Fibra',v:Math.round(tot.fibra),m:25,c:C.green},
                ].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:10,color:C.textSec,fontWeight:500}}>{l}</span>
                      <span style={{fontSize:10,color:C.text,fontWeight:700}}>{v}<span style={{color:C.textMuted}}>/{m}g</span></span>
                    </div>
                    <div style={{height:3,background:C.border,borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:3,transition:'width .5s'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions in Mi Dia */}
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            {[
              {icon:'📅',l:'Historial',fn:()=>setShowHistory(true)},
              {icon:'📊',l:'Semana',fn:()=>setShowWeekly(true)},
              {icon:'📤',l:'Compartir',fn:()=>setShowShare(true)},
            ].map(({icon,l,fn})=>(
              <button key={l} className="tap" onClick={fn} style={{flex:1,padding:'11px 8px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surface,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',fontFamily:F}}>
                <span style={{fontSize:20}}>{icon}</span>
                <span style={{fontSize:11,fontWeight:600,color:C.textSec}}>{l}</span>
              </button>
            ))}
          </div>

          {log.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:52,marginBottom:12}}>📋</div>
              <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Diario vacío</div>
              <div style={{fontSize:13,color:C.textSec,marginBottom:20,fontWeight:500}}>Ve a Agregar y registra tu primera comida</div>
              <button className="tap" onClick={()=>setTab(1)} style={{background:'#007AFF',color:'white',border:'none',borderRadius:16,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F,boxShadow:`0 6px 18px ${C.primary}40`}}>Agregar comida</button>
            </div>
          ):<>
            {MEALS.map(m=>{
              const items=log.filter(r=>r.comida===m);
              if(!items.length) return null;
              const mc=items.reduce((s,r)=>({cal:s.cal+r.cal*r.qty,prot:s.prot+r.prot*r.qty,carbs:s.carbs+r.carbs*r.qty,grasas:s.grasas+r.grasas*r.qty}),{cal:0,prot:0,carbs:0,grasas:0});
              return (
                <div key={m} style={{marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${MC[m]},${MC[m]}BB)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:`0 3px 10px ${MC[m]}40`}}>{MI[m]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.text}}>{m}</div>
                      <div style={{fontSize:10,color:C.textSec,fontWeight:600,marginTop:1}}>{Math.round(mc.cal)} kcal · P:{Math.round(mc.prot)}g C:{Math.round(mc.carbs)}g G:{Math.round(mc.grasas)}g</div>
                    </div>
                    <span style={{fontSize:12,fontWeight:800,color:MC[m]}}>{Math.round(mc.cal)} kcal</span>
                  </div>
                  {items.map(item=>(
                    <div key={item.uid} style={{display:'flex',alignItems:'center',gap:10,background:C.surface,borderRadius:17,padding:'11px 14px',marginBottom:6,boxShadow:`0 2px 8px rgba(0,0,0,${dark?.1:.05})`,borderLeft:`3px solid ${MC[m]}`}}>
                      <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</div>
                        <div style={{fontSize:9,color:C.textMuted,fontWeight:500,marginTop:1}}>{item.grams?`${item.grams}g por porción`:`${item.porcion||100}g por porción`}</div>
                        <div style={{display:'flex',gap:5,marginTop:3}}>
                          <span style={{fontSize:11,fontWeight:800,color:C.primary}}>{Math.round(item.cal*itemRatio(item)*item.qty)} kcal</span>
                          <span style={{fontSize:10,color:C.red,fontWeight:600}}>P:{Math.round(item.prot*itemRatio(item)*item.qty)}g</span>
                          <span style={{fontSize:10,color:C.amber,fontWeight:600}}>C:{Math.round(item.carbs*itemRatio(item)*item.qty)}g</span>
                        </div>
                      </div>
                      <Stepper value={item.qty} onDec={()=>adj(item.uid,-1)} onInc={()=>adj(item.uid,1)}/>
                    </div>
                  ))}
                </div>
              );
            })}
            <button className="tap" onClick={()=>setLog([])} style={{
  width:'100%',padding:'13px',borderRadius:16,
  border:`1px solid ${'#FF3B30'}44`,
  background:'#FF3B3010',color:'#FF3B30',
  fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:F,marginTop:4,
}}>🗑️ Reiniciar el día</button>
          </>}
        </div>}

        {/* ══════════════════════════════════
            TAB 3 — OBJETIVOS
        ══════════════════════════════════ */}
        {tab===4&&<div className={tabAnim}>

          {/* Profile */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>👤 Mi perfil</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              {[{l:'Nombre',k:'_nombre',special:true},{l:'Peso (kg)',k:'peso'},{l:'Altura (cm)',k:'altura'},{l:'Edad',k:'edad'}].map(({l,k,special})=>(
                <div key={k} style={k==='_nombre'?{gridColumn:'1/-1'}:{}}>
                  <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:6,fontFamily:F}}>{l}</div>
                  <input type={special?'text':'number'}
                    value={special?nombre:perfil[k]}
                    onChange={e=>special?setNombre(e.target.value):setPerfil({...perfil,[k]:+e.target.value})}
                    style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:special?15:16,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:7,fontFamily:F}}>Sexo</div>
              <div style={{display:'flex',gap:8}}>
                {[{v:'M',l:'♂ Hombre'},{v:'F',l:'♀ Mujer'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setPerfil({...perfil,sexo:v})} style={{flex:1,padding:'11px',borderRadius:13,border:'none',background:perfil.sexo===v?C.primary:C.surfaceAlt,color:perfil.sexo===v?'#FFFFFF':C.textSec,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:8,fontFamily:F}}>Actividad física</div>
              <div style={{display:'flex',flexDirection:'column',gap:5}}>
                {[{v:'1.2',l:'🛋️ Sedentario'},{v:'1.375',l:'🚶 Ligero (1–2/sem)'},{v:'1.55',l:'🏃 Moderado (3–5/sem)'},{v:'1.725',l:'💪 Activo (6–7/sem)'},{v:'1.9',l:'🔥 Muy activo'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setPerfil({...perfil,act:v})} style={{padding:'11px 14px',borderRadius:13,textAlign:'left',border:`1.5px solid ${perfil.act===v?C.primary:C.border}`,background:perfil.act===v?`${C.primary}12`:C.surfaceAlt,color:perfil.act===v?C.primary:C.textSec,fontSize:12,fontWeight:perfil.act===v?700:500,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop:12,background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:22}}>🔔</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recordatorios</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>Aviso para registrar comidas</div>
              </div>
              <button className="tap" onClick={()=>{setNotifEnabled(!notifEnabled);haptic('medium');}} style={{width:50,height:28,borderRadius:14,border:'none',cursor:'pointer',background:notifEnabled?'#34C759':'rgba(120,120,128,0.2)',position:'relative',transition:'background .25s ease'}}>
                <div style={{position:'absolute',top:3,left:notifEnabled?24:3,width:22,height:22,borderRadius:11,background:'white',boxShadow:'0 2px 6px rgba(0,0,0,0.25)',transition:'left .25s cubic-bezier(.34,1.56,.64,1)'}}/>
              </button>
            </div>

            <div style={{marginTop:14,background:'linear-gradient(135deg,#FF9500,#FF6B00)',borderRadius:16,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 6px 18px rgba(255,149,0,0.35)'}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontWeight:700,textTransform:'uppercase'}}>Tu TDEE</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:500,marginTop:2}}>Calorías quemadas / día</div>
              </div>
              <div><span style={{fontSize:32,fontWeight:800,color:'white'}}>{tdee}</span><span style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}> kcal</span></div>
            </div>
          </div>

          {/* Weight tracker */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>⚖️ Registro de peso</div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <input type="number" value={newWeight} onChange={e=>setNewWeight(e.target.value)} placeholder="Ej: 72.5"
                style={{flex:1,padding:'12px 14px',border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:16,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
              <button className="tap" onClick={addWeight} style={{padding:'12px 18px',borderRadius:14,border:'none',background:'#007AFF',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Registrar</button>
            </div>
            {weights.length>0?(
              <>
                <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                  {weights.slice(-7).reverse().map((w,i)=>(
                    <div key={i} style={{flexShrink:0,background:C.surfaceAlt,borderRadius:14,padding:'10px 12px',textAlign:'center',minWidth:60,border:`1.5px solid ${i===0?C.primary:C.border}`}}>
                      <div style={{fontSize:16,fontWeight:800,color:i===0?C.primary:C.text,lineHeight:1}}>{w.val}</div>
                      <div style={{fontSize:8,color:C.textMuted,fontWeight:600,marginTop:3}}>kg</div>
                      <div style={{fontSize:8,color:C.textMuted,marginTop:1}}>{w.date.slice(5)}</div>
                    </div>
                  ))}
                </div>
                {weights.length>=2&&(
                  <div style={{marginTop:10,padding:'10px 14px',background:C.surfaceAlt,borderRadius:13,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:12,color:C.textSec,fontWeight:600}}>Variación total</span>
                    <span style={{fontSize:14,fontWeight:800,color:weights[weights.length-1].val>weights[0].val?C.red:C.green}}>
                      {(weights[weights.length-1].val-weights[0].val>0?'+':'')}{(weights[weights.length-1].val-weights[0].val).toFixed(1)} kg
                    </span>
                  </div>
                )}
              </>
            ):<div style={{textAlign:'center',padding:'12px 0',color:C.textMuted,fontSize:13,fontWeight:500}}>Sin registros aún</div>}
          </div>

          {/* Goal selector */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>🎯 Mi objetivo</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
              {[{k:'bajar',icon:'🔥',l:'Bajar peso',sub:'−500 kcal',c:C.red},{k:'mantener',icon:'⚖️',l:'Mantener',sub:'= TDEE',c:C.blue},{k:'recomp',icon:'💪',l:'Recomp.',sub:'Alta prot.',c:C.purple},{k:'subir',icon:'📈',l:'Ganar masa',sub:'+300 kcal',c:C.green}].map(({k,icon,l,sub,c})=>(
                <button key={k} className="tap" onClick={()=>setObj(k)} style={{padding:'14px 10px',borderRadius:18,border:`2px solid ${obj===k?c:C.border}`,background:obj===k?`${c}14`:C.surfaceAlt,cursor:'pointer',fontFamily:F,textAlign:'center',boxShadow:obj===k?`0 4px 16px ${c}25`:'none',transition:'all .2s'}}>
                  <div style={{fontSize:26,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:12,fontWeight:800,color:obj===k?c:C.textSec,lineHeight:1.2}}>{l}</div>
                  <div style={{fontSize:9,color:C.textMuted,fontWeight:600,marginTop:3}}>{sub}</div>
                </button>
              ))}
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:16,padding:'14px'}}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Metas diarias</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {[{l:'Calorías',v:metas.cal,u:'kcal',c:'#1C1C1E'},{l:'Proteínas',v:metas.prot,u:'g',c:C.red},{l:'Carbos',v:metas.carbs,u:'g',c:C.amber},{l:'Grasas',v:metas.grasas,u:'g',c:C.purple}].map(({l,v,u,c})=>(
                  <div key={l} style={{background:c,borderRadius:14,padding:'10px 6px',textAlign:'center'}}>
                    <div style={{color:'white',fontSize:17,fontWeight:800,lineHeight:1}}>{v}</div>
                    <div style={{color:'rgba(255,255,255,0.45)',fontSize:8,margin:'2px 0'}}>{u}</div>
                    <div style={{color:'rgba(255,255,255,0.6)',fontSize:8,fontWeight:700}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diet plans */}
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>🥗 Planes sugeridos</div>
          {DIETAS.map(d=>(
            <div key={d.id} style={{background:C.surface,borderRadius:22,marginBottom:10,border:`2px solid ${expanded===d.id?d.color:C.border}`,boxShadow:expanded===d.id?`0 6px 24px ${d.color}22`:`0 2px 10px rgba(0,0,0,${dark?.12:.06})`,overflow:'hidden',transition:'all .2s'}}>
              <div style={{padding:'14px 16px',cursor:'pointer'}} onClick={()=>setExpand(expanded===d.id?null:d.id)}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:48,height:48,borderRadius:14,background:`${d.color}16`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{d.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.text}}>{d.nombre}</div>
                    <div style={{fontSize:11,color:C.textSec,fontWeight:500,marginTop:2}}>{d.desc}</div>
                    <div style={{display:'flex',gap:6,marginTop:5}}>
                      <span style={{fontSize:10,background:`${d.color}14`,color:d.color,padding:'3px 9px',borderRadius:10,fontWeight:800}}>{d.cals}</span>
                      <span style={{fontSize:10,color:C.textMuted,fontWeight:500}}>{d.macros}</span>
                    </div>
                  </div>
                  <div style={{fontSize:14,color:expanded===d.id?d.color:C.textMuted,transition:'transform .2s',transform:expanded===d.id?'rotate(180deg)':'rotate(0deg)'}}>▾</div>
                </div>
              </div>
              {expanded===d.id&&(
                <div style={{padding:'0 16px 16px',borderTop:`1.5px solid ${C.border}`}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.text,margin:'12px 0 8px'}}>✅ Reglas clave</div>
                  {d.reglas.map((r,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:5}}>
                      <span style={{color:d.color,fontSize:12,flexShrink:0,lineHeight:1.5}}>●</span>
                      <span style={{fontSize:11,color:C.textSec,fontWeight:500,lineHeight:1.5}}>{r}</span>
                    </div>
                  ))}
                  <div style={{fontSize:11,fontWeight:800,color:C.text,margin:'12px 0 10px'}}>🗓️ Menú ejemplo</div>
                  {d.menu.map((mx,i)=>(
                    <div key={i} style={{marginBottom:6,padding:'10px 12px',background:C.surfaceAlt,borderRadius:13,borderLeft:`3px solid ${d.color}`}}>
                      <div style={{fontSize:11,fontWeight:800,color:d.color,marginBottom:2}}>{mx.t}</div>
                      <div style={{fontSize:11,color:C.textSec,fontWeight:500,lineHeight:1.4}}>{mx.d}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>}
      </div>

        {/* ══════════════════════════════════
            TAB 4 — ESTADÍSTICAS
        ══════════════════════════════════ */}
        {tab===3&&<div className={tabAnim}>

          {/* Gráfico semanal */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text,letterSpacing:'-.3px'}}>Calorías — 7 días</div>
              <div style={{fontSize:11,color:C.textSec,background:C.surfaceAlt,padding:'4px 10px',borderRadius:10,fontWeight:600}}>Meta: {metas.cal} kcal</div>
            </div>
            <WeekChart data={weekData} meta={metas.cal} C={C} F={F}/>
          </div>

          {/* Esta semana */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>📊 Esta semana</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {l:'Días registrados',v:`${weekData.filter(d=>d.cal>0).length}/7`,c:'#007AFF'},
                {l:'Mejor día',v:`${Math.max(...weekData.map(d=>d.cal),0)} kcal`,c:'#34C759'},
                {l:'Días en meta',v:`${weekData.filter(d=>d.cal>0&&d.cal<=metas.cal).length}`,c:'#FF9500'},
                {l:'Racha actual',v:`${streak.days} día${streak.days!==1?'s':''}`,c:'#FF3B30'},
              ].map(({l,v,c2=null,c})=>(
                <div key={l} style={{background:C.surfaceAlt,borderRadius:16,padding:'14px',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:20,fontWeight:800,color:c,letterSpacing:'-.5px',lineHeight:1}}>{v}</div>
                  <div style={{fontSize:11,color:C.textSec,fontWeight:400,marginTop:4,lineHeight:1.3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Logros */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>🏆 Logros</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {icon:'🌱',l:'Primer registro',  desc:'Registra tu primera comida',       done:log.length>0||weekData.some(d=>d.cal>0)},
                {icon:'💧',l:'Bien hidratado',   desc:'Completa 8 vasos de agua',         done:agua>=8},
                {icon:'🔥',l:'3 días seguidos',  desc:'Mantén racha de 3+ días',          done:streak.days>=3},
                {icon:'🏆',l:'7 días seguidos',  desc:'Una semana completa',              done:streak.days>=7},
                {icon:'✅',l:'Día completo',     desc:'Registra las 5 comidas',           done:MEALS.every(m=>log.some(r=>r.comida===m))},
                {icon:'💪',l:'Primer ejercicio', desc:'Registra un ejercicio',            done:exercises.length>0||LS.get('ex_'+todayKey(),[]).length>0},
                {icon:'🎯',l:'En tu meta',       desc:'Cumple tu meta calórica',          done:pct>=0.9&&pct<=1.1},
                {icon:'⭐',l:'Primer favorito',  desc:'Guarda un alimento favorito',      done:favorites.length>0},
                {icon:'✨',l:'Chef personal',    desc:'Crea un alimento personalizado',   done:customFoods.length>0},
                {icon:'📝',l:'Diario activo',    desc:'Escribe una nota del día',         done:dayNote.length>0},
              ].map(({icon,l,desc,done})=>(
                <div key={l} style={{
                  padding:'12px',borderRadius:16,
                  background:done?`${done?'#34C759':'#007AFF'}10`:C.surfaceAlt,
                  border:`1px solid ${done?'#34C75940':C.border}`,
                  opacity:done?1:0.55,
                  transition:'all .3s',
                }}>
                  <div style={{fontSize:24,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:done?C.text:C.textSec,lineHeight:1.2}}>{l}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:3,lineHeight:1.3}}>{desc}</div>
                  {done&&<div style={{fontSize:10,color:'#34C759',fontWeight:700,marginTop:4}}>✓ Completado</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Actions grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            {[
              {icon:'📅',l:'Historial',sub:'14 días',fn:()=>setShowHistory(true),col:'#007AFF'},
              {icon:'📊',l:'Resumen semanal',sub:'Ver mi semana',fn:()=>setShowWeekly(true),col:'#34C759'},
              {icon:'🗓️',l:'Plan semanal',sub:'Lista compras',fn:()=>setShowPlanner(true),col:'#FF9500'},
              {icon:'📤',l:'Compartir',sub:'Mi progreso',fn:()=>setShowShare(true),col:'#AF52DE'},
            ].map(({icon,l,sub,fn,col})=>(
              <button key={l} className="tap" onClick={fn} style={{
                padding:'16px 12px',borderRadius:18,border:`1px solid ${C.border}`,background:C.surface,
                display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',fontFamily:F,
              }}>
                <div style={{width:46,height:46,borderRadius:14,background:`${col}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:C.text,textAlign:'center',lineHeight:1.2}}>{l}</div>
                <div style={{fontSize:10,color:C.textSec,textAlign:'center'}}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Planner + Shopping */}
          <button className="tap" onClick={()=>setShowPlanner(true)} style={{
            width:'100%',padding:'14px',borderRadius:18,marginBottom:12,
            border:`1px solid ${C.border}`,background:C.surface,
            display:'flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:F,
          }}>
            <span style={{fontSize:26}}>🗓️</span>
            <div style={{flex:1,textAlign:'left'}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>Planificador semanal</div>
              <div style={{fontSize:11,color:C.textSec,marginTop:2}}>Organiza tus comidas · Lista de compras automática</div>
            </div>
            <span style={{fontSize:16,color:C.textMuted}}>›</span>
          </button>

          {/* Mis alimentos personalizados */}
          {customFoods.length>0&&(
            <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:12}}>✨ Mis alimentos ({customFoods.length})</div>
              {customFoods.map(f=>(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:22,flexShrink:0}}>{f.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.nombre}</div>
                    <div style={{fontSize:11,color:C.textSec}}>{f.porcion}g · {f.cal} kcal</div>
                  </div>
                  <button onClick={()=>setCustomFoods(customFoods.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',color:C.red,fontSize:14,cursor:'pointer',padding:4}}>✕</button>
                </div>
              ))}
            </div>
          )}

        </div>}

      {/* ══ TOAST ══ */}
      {toast&&(
        <div style={{
          position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',
          background:'#1C1C1E',color:'#FFFFFF',
          padding:'12px 22px',borderRadius:20,fontSize:13,fontWeight:700,
          fontFamily:F,zIndex:40,whiteSpace:'nowrap',
          boxShadow:'0 8px 24px rgba(0,0,0,0.35)',
          animation:'fadeUp .3s ease',
        }}>{toast}</div>
      )}

      {/* ══ BOTTOM NAV ══ */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:30,background:C.navBg,backdropFilter:'blur(16px)',borderTop:`1px solid ${C.border}`,padding:'8px 8px 22px',display:'flex',transition:'background .3s'}}>
        {[{icon:'🏠',lbl:'Inicio'},{icon:'➕',lbl:'Agregar'},{icon:'📋',lbl:'Mi Día'},{icon:'📊',lbl:'Stats'},{icon:'🎯',lbl:'Perfil'}].map(({icon,lbl},i)=>(
          <button key={i} className="nav-btn tap" onClick={()=>goTab(i)} style={{
            flex:1,border:'none',background:'none',cursor:'pointer',fontFamily:F,
            display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'5px 0',
          }}>
            <div style={{
              width:44,height:32,borderRadius:22,
              background:tab===i?'#34C75920':'transparent',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,
              transform:tab===i?'scale(1.15)':'scale(1)',
              transition:'all .28s cubic-bezier(.34,1.56,.64,1)',
            }}>{icon}</div>
            <div style={{
              fontSize:10,
              fontWeight:tab===i?700:400,
              color:tab===i?'#34C759':C.textMuted,
              transition:'all .2s ease',
              letterSpacing:'-.2px',
            }}>{lbl}</div>
          </button>
        ))}
      </div>

    </div>
  );
}