import { useState, useMemo, useEffect, useCallback } from "react";

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

  /* ── SUPLEMENTOS ── */
  {id:320,nombre:"Whey protein Gold Standard",    marca:"ON",           cat:"Suplementos",porcion:31,  cal:120, prot:24,  carbs:3,   grasas:2,   fibra:0,   emoji:"💪"},
  {id:321,nombre:"Proteína vegana (guisante)",    marca:"Genérico",     cat:"Suplementos",porcion:30,  cal:110, prot:20,  carbs:5,   grasas:2.5, fibra:1,   emoji:"🌱"},
  {id:322,nombre:"Barra proteica Quest",          marca:"Quest",        cat:"Suplementos",porcion:60,  cal:190, prot:21,  carbs:22,  grasas:8,   fibra:14,  emoji:"🍫"},
  {id:323,nombre:"Creatina monohidratada",        marca:"Genérico",     cat:"Suplementos",porcion:5,   cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0,   emoji:"⚗️"},
  {id:324,nombre:"BCAA polvo",                    marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:8,   carbs:0,   grasas:0,   fibra:0,   emoji:"💊"},
  {id:325,nombre:"Colágeno hidrolizado",          marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:9,   carbs:0,   grasas:0,   fibra:0,   emoji:"✨"},
];

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
const CATS = ["Todas","Lácteos","Carnes","Cecinas","Panes","Cereales","Snacks","Bebidas","Frutas","Verduras","Legumbres","Granos","Pescados","Huevos","Comidas CL","Congelados","Aceites","Condimentos","Suplementos"];
const MEALS = ["Desayuno","Almuerzo","Once","Cena","Snack"];
const MC = {Desayuno:"#C8784A",Almuerzo:"#B85A3C",Once:"#7050A8",Cena:"#2B3D35",Snack:"#3D7A55"};
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
const sumLog = (log) => log.reduce((a,i)=>{
  const r=itemRatio(i);
  return {cal:a.cal+i.cal*r*i.qty,prot:a.prot+i.prot*r*i.qty,carbs:a.carbs+i.carbs*r*i.qty,grasas:a.grasas+i.grasas*r*i.qty,fibra:a.fibra+i.fibra*r*i.qty};
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
  bg:'#F5F0E8', surface:'#FFFFFF', surfaceAlt:'#F0EAE0', border:'#E4DDD0',
  primary:'#2B3D35', primaryMid:'#3D5C4E', primaryLight:'#4A7862', glow:'#6BAF85',
  accent:'#B8784A', accentLight:'#D4986A', gold:'#C8963C',
  text:'#1A1A14', textSec:'#6A6458', textMuted:'#ADA59A',
  navBg:'rgba(255,252,247,0.97)', headerBg:'#2B3D35',
  red:'#B85A3C', blue:'#4A7BA8', purple:'#7050A8', green:'#2E7A4A', amber:'#A07030',
};
const DARK = {
  bg:'#0D1710', surface:'#152018', surfaceAlt:'#1C2C1E', border:'#263C28',
  primary:'#5AAF7A', primaryMid:'#4A9468', primaryLight:'#6ECC8A', glow:'#6ECC8A',
  accent:'#D4986A', accentLight:'#E8B485', gold:'#D4A84C',
  text:'#EAE6DC', textSec:'#8A9E8C', textMuted:'#3E5440',
  navBg:'rgba(13,23,16,0.97)', headerBg:'#0D1710',
  red:'#D4705A', blue:'#6A9EC8', purple:'#9070C8', green:'#4A9E6A', amber:'#C09050',
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
   SPLASH SCREEN
═══════════════════════════════════════════════════════ */
function Splash({onDone}) {
  const [fade,setFade]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setFade(true),1400);
    const t2=setTimeout(()=>onDone(),1900);
    return ()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return (
    <div style={{
      position:'fixed',inset:0,
      background:'#2B3D35',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      gap:20,zIndex:100,
      opacity:fade?0:1,transition:'opacity .5s ease',
    }}>
      <div style={{animation:'splashPop .6s cubic-bezier(.34,1.56,.64,1) both'}}>
        <Logo size={90}/>
      </div>
      <div style={{textAlign:'center'}}>
        <div style={{color:'white',fontSize:32,fontWeight:800,fontFamily:F,letterSpacing:'-1px'}}>Calorú</div>
        <div style={{color:'rgba(255,255,255,0.45)',fontSize:14,fontFamily:F,fontWeight:500,marginTop:4}}>Tu nutrición, a tu ritmo</div>
      </div>
      <div style={{marginTop:8,display:'flex',gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{
            width:i===0?22:6,height:6,borderRadius:3,
            background:i===0?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.2)',
            transition:'width .3s',
          }}/>
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
        background:nombre.trim()?C.primary:'#CCC',color:'white',
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
              background:perfil.sexo===v?C.primary:C.surfaceAlt,
              color:perfil.sexo===v?'white':C.textSec,
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
      <button onClick={()=>setStep(2)} style={{padding:'16px',borderRadius:18,border:'none',background:C.primary,color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer'}}>Continuar →</button>
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
      <div style={{background:`${C.primary}12`,borderRadius:16,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,color:C.textSec,fontFamily:F,fontWeight:500}}>Tu meta calórica estimada</div>
        <div style={{fontSize:22,fontWeight:800,color:C.primary,fontFamily:F}}>{calcMetas(calcTDEE(perfil),obj).cal} kcal</div>
      </div>
      <button onClick={()=>onDone({nombre:nombre.trim(),perfil,obj})} style={{
        padding:'16px',borderRadius:18,border:'none',
        background:`linear-gradient(135deg,${C.primary},${C.primaryMid})`,
        color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
        boxShadow:`0 8px 24px ${C.primary}40`,
      }}>¡Comenzar! 🎉</button>
    </div>,
  ];

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:F,overflowY:'auto'}}>
      {/* Progress bar */}
      <div style={{height:3,background:C.border}}>
        <div style={{height:'100%',width:`${(step+1)/3*100}%`,background:C.primary,transition:'width .4s ease'}}/>
      </div>
      {step>0&&(
        <button onClick={()=>setStep(step-1)} style={{margin:'12px 16px 0',background:'none',border:'none',color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',gap:4}}>
          ← Atrás
        </button>
      )}
      <div style={{animation:'fadeUp .3s ease'}}>
        {steps[step]}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DONUT CHART
═══════════════════════════════════════════════════════ */
function DonutChart({prot,carbs,grasas,total,size=160,C}) {
  if(total===0) return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx={80} cy={80} r={54} fill="none" stroke={C.border} strokeWidth={18}/>
      <text x={80} y={85} textAnchor="middle" fontSize={13} fontWeight={600} fill={C.textMuted} fontFamily={F}>Sin datos</text>
    </svg>
  );
  const r=54, circ=2*Math.PI*r;
  const macroTotal=(prot*4)+(carbs*4)+(grasas*9);
  const pProt=macroTotal>0?(prot*4/macroTotal):0;
  const pCarbs=macroTotal>0?(carbs*4/macroTotal):0;
  const pGrasas=macroTotal>0?(grasas*9/macroTotal):0;
  let off=0;
  const segs=[
    {p:pProt, c:'#B85A3C', label:'Prot'},
    {p:pCarbs, c:'#A07030', label:'Carbs'},
    {p:pGrasas,c:'#7050A8', label:'Grasas'},
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 160 160">
      <circle cx={80} cy={80} r={r} fill="none" stroke={C.border} strokeWidth={18}/>
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
      <text x={80} y={74} textAnchor="middle" fontSize={11} fontWeight={600} fill={C.textMuted} fontFamily={F}>Total</text>
      <text x={80} y={90} textAnchor="middle" fontSize={22} fontWeight={800} fill={C.text} fontFamily={F}>{Math.round(total)}</text>
      <text x={80} y={105} textAnchor="middle" fontSize={11} fontWeight={500} fill={C.textMuted} fontFamily={F}>kcal</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   MODAL DETALLE CON AJUSTE DE GRAMOS
═══════════════════════════════════════════════════════ */
function ModalDetalle({food, meal, C, F, onClose, onAdd}) {
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
              boxShadow:mode===v?'0 2px 8px rgba(0,0,0,0.08)':'none',
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
                  border:`1.5px solid ${grams===g?C.primary:C.border}`,
                  background:grams===g?`${C.primary}14`:C.surfaceAlt,
                  color:grams===g?C.primary:C.textSec,
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
              <button onClick={()=>setGrams(grams+5)} style={{width:38,height:38,borderRadius:11,border:'none',background:C.primary,fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
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

        <button onClick={()=>onAdd({...food, grams: mode==='gramos'?grams:null})} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:`linear-gradient(135deg,${C.primary},${C.primaryMid})`,
          color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
          boxShadow:`0 8px 20px ${C.primary}40`,
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
  const [onboarded,setOnboarded] = useState(()=>LS.get('onboarded',false));
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
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes splashPop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
      @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
      .anim{animation:fadeUp .3s ease}
      .tap:active{opacity:.7;transform:scale(.95);transition:all .1s}
    `;
    document.head.appendChild(s);
  },[]);
  useEffect(()=>{document.body.style.background=C.bg;},[dark]);

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
        const newLog=LS.get('log_'+today,[]);
        const newAgua=LS.get('agua_'+today,0);
        setLog(newLog);
        setAgua(newAgua);
        setStreak(prev=>{
          const s=LS.get('streak',{days:0,last:''});
          return s;
        });
        setToast('¡Nuevo día! Contadores reiniciados 🌅');
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

  const foods  = useMemo(()=>DB.filter(a=>{
    const s=q.toLowerCase();
    return (a.nombre.toLowerCase().includes(s)||a.marca.toLowerCase().includes(s))&&(cat==='Todas'||a.cat===cat);
  }),[q,cat]);

  /* ── actions ── */
  const addFood = useCallback((a)=>{
    const ex=log.find(r=>r.id===a.id&&r.comida===meal&&r.grams===(a.grams||null));
    if(ex) setLog(log.map(r=>r.uid===ex.uid?{...r,qty:r.qty+1}:r));
    else   setLog([...log,{...a,comida:meal,qty:1,uid:Date.now()+Math.random(),grams:a.grams||null}]);
    setRecent(prev=>{const f=prev.filter(x=>x.id!==a.id);return [a,...f].slice(0,8);});
    setDetail(null);
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
      <button onClick={onInc} style={{width:30,height:30,borderRadius:9,border:'none',background:C.primary,color:'white',fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
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
        <ModalDetalle food={detailFood} meal={meal} C={C} F={F} onClose={()=>setDetail(null)} onAdd={addFood}/>
      )}

      {/* ══ HEADER ══ */}
      <div style={{background:C.headerBg,padding:'14px 18px 12px',position:'sticky',top:0,zIndex:20,boxShadow:'0 1px 20px rgba(0,0,0,0.3)',transition:'background .3s'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Logo size={38}/>
            <div>
              <div style={{color:'white',fontSize:17,fontWeight:800,letterSpacing:'-.5px',lineHeight:1}}>Calorú</div>
              <div style={{color:'rgba(255,255,255,0.38)',fontSize:10,fontWeight:500,marginTop:1}}>
                {new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'short'})}
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{textAlign:'right'}}>
              <div style={{color:'white',fontSize:14,fontWeight:800,lineHeight:1}}>{Math.round(tot.cal)}<span style={{fontSize:10,opacity:.45}}> / {metas.cal}</span></div>
              <div style={{color:'rgba(255,255,255,0.38)',fontSize:10,marginTop:1}}>{tot.cal>metas.cal?`+${sobre} excedido`:`${reste} restantes`}</div>
            </div>
            <button className="tap" onClick={()=>{const nd=!dark;setDark(nd);LS.set('dark',nd);}} style={{width:34,height:34,borderRadius:11,border:'none',background:'rgba(255,255,255,0.1)',color:'white',fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {dark?'☀️':'🌙'}
            </button>
          </div>
        </div>
        <div style={{height:3,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${Math.min(pct*100,100)}%`,background:tot.cal>metas.cal?C.red:C.glow,borderRadius:3,transition:'width .7s ease'}}/>
        </div>
      </div>

      <div style={{padding:'14px 14px 0'}}>

        {/* ══════════════════════════════════
            TAB 0 — INICIO
        ══════════════════════════════════ */}
        {tab===0&&<div className="anim">

          {/* Saludo */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:22,fontWeight:800,color:C.text,letterSpacing:'-.5px',lineHeight:1.2}}>{SALUDO}, {primerNombre} 👋</div>
            <div style={{fontSize:13,color:C.textSec,fontWeight:500,marginTop:3}}>
              {pct===0?'¿Qué vas a comer hoy?':pct<.5?'¡Buen comienzo!':pct<.9?'¡Vas muy bien! 🌿':'¡Casi en tu meta! 🎯'}
            </div>
          </div>

          {/* ── STREAK + LOGROS ── */}
          <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:14,scrollbarWidth:'none'}}>
            {/* Racha */}
            <div style={{flexShrink:0,borderRadius:18,padding:'10px 14px',display:'flex',alignItems:'center',gap:9,
              background:streak.days>0?`linear-gradient(135deg,${C.red},${C.accent})`:`${C.surfaceAlt}`,
              boxShadow:streak.days>0?`0 4px 16px ${C.red}40`:'none',
            }}>
              <span style={{fontSize:22}}>🔥</span>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:streak.days>0?'white':C.text,lineHeight:1}}>{streak.days} día{streak.days!==1?'s':''} seguidos</div>
                <div style={{fontSize:10,color:streak.days>0?'rgba(255,255,255,0.6)':C.textMuted,fontWeight:500,marginTop:1}}>Racha actual</div>
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

          {/* ── CALORIE RING HERO ── */}
          <div style={{
            background:`linear-gradient(145deg,${C.primary},${C.primaryMid})`,
            borderRadius:28,padding:'20px',marginBottom:12,
            boxShadow:`0 12px 36px ${C.primary}44`,
            position:'relative',overflow:'hidden',
          }}>
            <div style={{position:'absolute',right:-20,top:-20,width:130,height:130,background:'rgba(255,255,255,0.04)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div style={{position:'absolute',left:-30,bottom:-30,width:110,height:110,background:'rgba(255,255,255,0.03)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:16,position:'relative'}}>
              {/* Ring */}
              <div style={{flexShrink:0,position:'relative',width:130,height:130}}>
                <svg width={130} height={130} viewBox="0 0 120 120">
                  <circle cx={60} cy={60} r={ringR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12}/>
                  <circle cx={60} cy={60} r={ringR} fill="none"
                    stroke={tot.cal>metas.cal?'#E87060':C.glow} strokeWidth={12}
                    strokeDasharray={`${ringPct*ringC} ${ringC}`} strokeLinecap="round"
                    transform="rotate(-90 60 60)" style={{transition:'stroke-dasharray .8s ease'}}/>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:600,textTransform:'uppercase',letterSpacing:.8}}>{tot.cal>metas.cal?'Exceso':'Libres'}</div>
                  <div style={{fontSize:26,fontWeight:800,color:'white',lineHeight:1.1}}>{tot.cal>metas.cal?sobre:reste}</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:500}}>kcal</div>
                </div>
              </div>
              {/* Stats */}
              <div style={{flex:1}}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Consumido hoy</div>
                  <div style={{fontSize:32,fontWeight:800,color:'white',lineHeight:1}}>{Math.round(tot.cal)}<span style={{fontSize:13,opacity:.4}}> kcal</span></div>
                </div>
                {[{l:'Proteínas',v:tot.prot,m:metas.prot,c:'#E8907A'},{l:'Carbos',v:tot.carbs,m:metas.carbs,c:'#D4A870'},{l:'Grasas',v:tot.grasas,m:metas.grasas,c:'#B090D8'}].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:6}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:9,color:'rgba(255,255,255,0.4)',fontWeight:700}}>{l}</span>
                      <span style={{fontSize:9,color:'rgba(255,255,255,0.65)',fontWeight:800}}>{Math.round(v)}/{m}g</span>
                    </div>
                    <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:4,transition:'width .5s ease'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 4 MACRO CARDS ── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
            {[
              {k:'prot',  lS:'Prot',  g:[C.red,   '#C87060'], sh:`${C.red}55`},
              {k:'carbs', lS:'Carbs', g:[C.amber,  '#B89040'], sh:`${C.amber}55`},
              {k:'grasas',lS:'Grasas',g:[C.purple, '#907888'], sh:`${C.purple}55`},
              {k:'fibra', lS:'Fibra', g:[C.green,  '#3D8A59'], sh:`${C.green}55`},
            ].map(({k,lS,g,sh})=>{
              const v=tot[k], m=k==='fibra'?25:metas[k], p2=m>0?Math.min(v/m*100,100):0;
              const r2=20, circ2=2*Math.PI*r2;
              return (
                <div key={k} style={{background:`linear-gradient(145deg,${g[0]},${g[1]})`,borderRadius:20,padding:'12px 6px 10px',boxShadow:`0 6px 18px ${sh}`,textAlign:'center',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:-12,right:-12,width:44,height:44,background:'rgba(255,255,255,0.08)',borderRadius:'50%',pointerEvents:'none'}}/>
                  <div style={{position:'relative',width:46,height:46,margin:'0 auto 5px'}}>
                    <svg width={46} height={46} viewBox="0 0 46 46">
                      <circle cx={23} cy={23} r={r2} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={5}/>
                      <circle cx={23} cy={23} r={r2} fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth={5}
                        strokeDasharray={`${p2/100*circ2} ${circ2}`} strokeLinecap="round"
                        transform="rotate(-90 23 23)" style={{transition:'stroke-dasharray .7s ease'}}/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <div style={{fontSize:13,fontWeight:800,color:'white',lineHeight:1}}>{Math.round(v)}</div>
                    </div>
                  </div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.82)',fontWeight:800,textTransform:'uppercase',letterSpacing:.6}}>{lS}</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.4)',marginTop:1}}>/{m}g</div>
                </div>
              );
            })}
          </div>

          {/* ── WATER TRACKER ── */}
          <div style={{background:'linear-gradient(145deg,#2A7BA8,#3A9ED4)',borderRadius:22,padding:'14px 16px',marginBottom:12,boxShadow:'0 6px 22px rgba(42,123,168,0.4)',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',right:-18,top:-18,width:90,height:90,background:'rgba(255,255,255,0.06)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,position:'relative'}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'white'}}>Hidratación</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.55)',fontWeight:500,marginTop:1}}>{agua===8?'¡Meta cumplida! 🎉':`${agua} de 8 vasos`}</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.14)',borderRadius:14,padding:'6px 12px',display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:20}}>💧</span>
                <span style={{fontSize:20,fontWeight:800,color:'white'}}>{agua}</span>
                <span style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>/8</span>
              </div>
            </div>
            <div style={{display:'flex',gap:5}}>
              {Array.from({length:8}).map((_,i)=>(
                <button key={i} className="tap" onClick={()=>setAgua(i<agua?i:i+1)} style={{flex:1,height:46,borderRadius:12,border:'none',cursor:'pointer',background:i<agua?'rgba(255,255,255,0.26)':'rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,padding:0,fontFamily:F,transition:'background .2s'}}>
                  <span style={{fontSize:15,opacity:i<agua?1:0.2,transition:'opacity .2s'}}>{i<agua?'💧':'○'}</span>
                  <span style={{fontSize:7,fontWeight:700,color:i<agua?'white':'rgba(255,255,255,0.3)'}}>{i+1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── MEAL CARDS ── */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>Comidas de hoy</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {MEALS.map(m=>{
                const items=log.filter(r=>r.comida===m);
                const cal=items.reduce((s,r)=>s+r.cal*r.qty,0);
                const p2=metas.cal>0?Math.min(cal/metas.cal*100,100):0;
                const has=items.length>0;
                return (
                  <div key={m} style={{borderRadius:20,overflow:'hidden',boxShadow:has?`0 6px 20px ${MC[m]}28`:`0 2px 10px rgba(0,0,0,${dark?.12:.05})`,border:`1.5px solid ${has?MC[m]+'50':C.border}`,transition:'all .3s'}}>
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
        {tab===1&&<div className="anim">
          {/* Meal selector */}
          <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:4,marginBottom:14,scrollbarWidth:'none'}}>
            {MEALS.map(m=>(
              <button key={m} className="tap" onClick={()=>setMeal(m)} style={{
                flexShrink:0,display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:20,border:'none',fontFamily:F,
                background:meal===m?MC[m]:C.surface,color:meal===m?'white':C.textSec,
                fontSize:13,fontWeight:700,cursor:'pointer',
                boxShadow:meal===m?`0 4px 14px ${MC[m]}50`:`0 1px 6px rgba(0,0,0,${dark?.15:.06})`,
                transition:'all .2s',
              }}>{MI[m]} {m}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{position:'relative',marginBottom:10}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:.35,pointerEvents:'none'}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto o marca..."
              style={{width:'100%',padding:'12px 40px 12px 42px',border:`1.5px solid ${q?C.primary:C.border}`,borderRadius:16,background:C.surface,fontSize:14,fontFamily:F,color:C.text,outline:'none',fontWeight:500,transition:'border-color .2s'}}/>
            {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',fontSize:20,cursor:'pointer',color:C.textMuted,lineHeight:1}}>×</button>}
          </div>

          {/* Categories */}
          <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:6,marginBottom:10,scrollbarWidth:'none'}}>
            {CATS.map(c=>(
              <button key={c} className="tap" onClick={()=>setCat(c)} style={{flexShrink:0,padding:'5px 12px',borderRadius:12,border:cat===c?'none':`1.5px solid ${C.border}`,background:cat===c?C.primary:C.surface,color:cat===c?'white':C.textSec,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{c}</button>
            ))}
          </div>

          {/* Recientes */}
          {!q&&recent.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textSec,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Recientes</div>
              <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                {recent.map(a=>(
                  <button key={a.id} className="tap" onClick={()=>setDetail(a)} style={{flexShrink:0,background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:16,padding:'10px 12px',textAlign:'center',cursor:'pointer',fontFamily:F,minWidth:72}}>
                    <div style={{fontSize:22,marginBottom:4}}>{a.emoji}</div>
                    <div style={{fontSize:9,fontWeight:700,color:C.text,lineHeight:1.2,maxWidth:68,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.nombre.split(' ').slice(0,2).join(' ')}</div>
                    <div style={{fontSize:10,fontWeight:800,color:C.primary,marginTop:2}}>{a.cal}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  background:C.surface,borderRadius:18,padding:'12px 14px',
                  border:`1.5px solid ${inLog?MC[meal]+'55':C.border}`,
                  boxShadow:inLog?`0 4px 16px ${MC[meal]}22`:`0 2px 8px rgba(0,0,0,${dark?.1:.05})`,
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
                  <div style={{width:34,height:34,borderRadius:10,background:inLog?MC[meal]:C.primary,color:'white',fontSize:18,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 3px 10px ${inLog?MC[meal]:C.primary}50`,transition:'all .2s'}}>
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
        {tab===2&&<div className="anim">
          {/* Summary hero */}
          <div style={{background:`linear-gradient(145deg,${C.primary},${C.primaryMid})`,borderRadius:24,padding:'18px',marginBottom:14,boxShadow:`0 8px 28px ${C.primary}44`}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Resumen del día</div>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <DonutChart prot={tot.prot} carbs={tot.carbs} grasas={tot.grasas} total={tot.cal} size={130} C={{border:'rgba(255,255,255,0.12)',textMuted:'rgba(255,255,255,0.4)',text:'white'}}/>
              <div style={{flex:1}}>
                {[
                  {l:'Proteínas',v:Math.round(tot.prot),m:metas.prot,c:'#E8907A'},
                  {l:'Carbohidratos',v:Math.round(tot.carbs),m:metas.carbs,c:'#D4A870'},
                  {l:'Grasas',v:Math.round(tot.grasas),m:metas.grasas,c:'#B090D8'},
                  {l:'Fibra',v:Math.round(tot.fibra),m:25,c:'#80C890'},
                ].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:7}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                      <span style={{fontSize:10,color:'rgba(255,255,255,0.45)',fontWeight:600}}>{l}</span>
                      <span style={{fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:800}}>{v}/{m}g</span>
                    </div>
                    <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:4,transition:'width .5s'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {log.length===0?(
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:52,marginBottom:12}}>📋</div>
              <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:6}}>Diario vacío</div>
              <div style={{fontSize:13,color:C.textSec,marginBottom:20,fontWeight:500}}>Ve a Agregar y registra tu primera comida</div>
              <button className="tap" onClick={()=>setTab(1)} style={{background:`linear-gradient(135deg,${C.primary},${C.primaryMid})`,color:'white',border:'none',borderRadius:16,padding:'12px 28px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F,boxShadow:`0 6px 18px ${C.primary}40`}}>Agregar comida</button>
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
            <button className="tap" onClick={()=>setLog([])} style={{width:'100%',padding:'12px',borderRadius:16,border:`1.5px solid ${C.border}`,background:C.surface,color:C.red,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F,marginTop:4}}>🗑️ Reiniciar el día</button>
          </>}
        </div>}

        {/* ══════════════════════════════════
            TAB 3 — OBJETIVOS
        ══════════════════════════════════ */}
        {tab===3&&<div className="anim">

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
                  <button key={v} className="tap" onClick={()=>setPerfil({...perfil,sexo:v})} style={{flex:1,padding:'11px',borderRadius:13,border:'none',background:perfil.sexo===v?C.primary:C.surfaceAlt,color:perfil.sexo===v?'white':C.textSec,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{l}</button>
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
            <div style={{marginTop:14,background:`linear-gradient(135deg,${C.accent},${C.accentLight})`,borderRadius:16,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:`0 6px 18px ${C.accent}40`}}>
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
              <button className="tap" onClick={addWeight} style={{padding:'12px 18px',borderRadius:14,border:'none',background:C.primary,color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Registrar</button>
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
                {[{l:'Calorías',v:metas.cal,u:'kcal',c:C.primary},{l:'Proteínas',v:metas.prot,u:'g',c:C.red},{l:'Carbos',v:metas.carbs,u:'g',c:C.amber},{l:'Grasas',v:metas.grasas,u:'g',c:C.purple}].map(({l,v,u,c})=>(
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

      {/* ══ TOAST ══ */}
      {toast&&(
        <div style={{
          position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',
          background:dark?'#2B3D35':'#1A2820',color:'white',
          padding:'12px 22px',borderRadius:20,fontSize:13,fontWeight:700,
          fontFamily:F,zIndex:40,whiteSpace:'nowrap',
          boxShadow:'0 8px 24px rgba(0,0,0,0.35)',
          animation:'fadeUp .3s ease',
        }}>{toast}</div>
      )}

      {/* ══ BOTTOM NAV ══ */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:30,background:C.navBg,backdropFilter:'blur(16px)',borderTop:`1px solid ${C.border}`,padding:'8px 8px 22px',display:'flex',transition:'background .3s'}}>
        {[{icon:'🏠',lbl:'Inicio'},{icon:'➕',lbl:'Agregar'},{icon:'📋',lbl:'Mi Día'},{icon:'🎯',lbl:'Objetivos'}].map(({icon,lbl},i)=>(
          <button key={i} className="tap" onClick={()=>setTab(i)} style={{flex:1,border:'none',background:'none',cursor:'pointer',fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'4px 0'}}>
            <div style={{width:48,height:34,borderRadius:13,background:tab===i?`${C.primary}18`:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:tab===i?22:19,transition:'all .2s'}}>{icon}</div>
            <div style={{fontSize:10,fontWeight:tab===i?800:500,color:tab===i?C.primary:C.textMuted,transition:'color .2s'}}>{lbl}</div>
          </button>
        ))}
      </div>

    </div>
  );
}
