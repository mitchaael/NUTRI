import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { supabase, syncProfile, syncSettings, syncDay, syncWeight, restoreFromSupabase } from './supabase.js';

/* ═══════════════════════════════════════════════════════
   BASE DE DATOS — 300+ productos supermercados chilenos
   porcion = gramos de la porción de referencia
═══════════════════════════════════════════════════════ */
const DB_RAW = [
  /* ── LÁCTEOS ── */
  {id:1,  nombre:"Leche entera Soprole",          marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:160, prot:8,   carbs:12,  grasas:9,   fibra:0, azucar:4.8, sodio:120,   emoji:"🥛", precio:1090, pesoCompra:1000},
  {id:2,  nombre:"Leche semidescremada Soprole",  marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:120, prot:9,   carbs:12,  grasas:4.5, fibra:0, azucar:4.8, sodio:130,   emoji:"🥛"},
  {id:3,  nombre:"Leche descremada Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:90,  prot:9,   carbs:12,  grasas:0.5, fibra:0, azucar:4.8, sodio:130,   emoji:"🥛"},
  {id:4,  nombre:"Leche entera Colun",            marca:"Colun",        cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:11,  grasas:8.5, fibra:0, azucar:4.8, sodio:110,   emoji:"🥛", precio:1090, pesoCompra:1000},
  {id:5,  nombre:"Leche semidescremada Colun",    marca:"Colun",        cat:"Lácteos",    porcion:250, cal:118, prot:9,   carbs:12,  grasas:4,   fibra:0, azucar:3.5, sodio:60,   emoji:"🥛"},
  {id:6,  nombre:"Leche entera Loncoleche",       marca:"Loncoleche",   cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:12,  grasas:9,   fibra:0, azucar:11, sodio:80,   emoji:"🥛"},
  {id:7,  nombre:"Leche de avena Oatly",          marca:"Oatly",        cat:"Lácteos",    porcion:250, cal:120, prot:3,   carbs:16,  grasas:5,   fibra:1.5, azucar:10, sodio:45, emoji:"🥛"},
  {id:8,  nombre:"Leche de almendra Blue Diamond",marca:"Blue Diamond", cat:"Lácteos",    porcion:250, cal:50,  prot:1.5, carbs:4,   grasas:3,   fibra:0.5, azucar:4, sodio:35, emoji:"🥛"},
  {id:9,  nombre:"Leche de soja Alpro",           marca:"Alpro",        cat:"Lácteos",    porcion:250, cal:95,  prot:8,   carbs:7,   grasas:4,   fibra:0.5, azucar:0, sodio:400, emoji:"🥛"},
  {id:10, nombre:"Leche de coco Aroy-D (200ml)",  marca:"Aroy-D",       cat:"Lácteos",    porcion:200, cal:280, prot:3,   carbs:4,   grasas:28,  fibra:0, azucar:0.3, sodio:350,   emoji:"🥥"},
  {id:11, nombre:"Yogurt natural Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:120, prot:7,   carbs:14,  grasas:4,   fibra:0, azucar:0, sodio:200,   emoji:"🥣", precio:1290, pesoCompra:500},
  {id:12, nombre:"Yogurt con fruta Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:140, prot:6,   carbs:20,  grasas:3.5, fibra:0, azucar:0, sodio:180,   emoji:"🥣"},
  {id:13, nombre:"Yogurt 0% Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:80,  prot:8,   carbs:12,  grasas:0,   fibra:0, azucar:4.8, sodio:120,   emoji:"🥣"},
  {id:14, nombre:"Yogurt natural Colun",          marca:"Colun",        cat:"Lácteos",    porcion:150, cal:135, prot:6,   carbs:15,  grasas:5,   fibra:0, azucar:4.8, sodio:130,   emoji:"🥣", precio:1490, pesoCompra:500},
  {id:15, nombre:"Yogurt griego Danone",          marca:"Danone",       cat:"Lácteos",    porcion:150, cal:135, prot:10,  carbs:13,  grasas:4,   fibra:0, azucar:11, sodio:80,   emoji:"🥣"},
  {id:16, nombre:"Yogurt griego 0% Danone",       marca:"Danone",       cat:"Lácteos",    porcion:150, cal:85,  prot:10,  carbs:13,  grasas:0,   fibra:0, azucar:13, sodio:90,   emoji:"🥣"},
  {id:17, nombre:"Yogurt bebible Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:200, cal:160, prot:6,   carbs:26,  grasas:3,   fibra:0, azucar:0.5, sodio:25,   emoji:"🥤"},
  {id:18, nombre:"Kéfir natural Colun",           marca:"Colun",        cat:"Lácteos",    porcion:150, cal:110, prot:7,   carbs:12,  grasas:3.5, fibra:0, azucar:13, sodio:90,   emoji:"🥣"},
  {id:19, nombre:"Queso gauda Colun",             marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:105, prot:7,   carbs:0.5, grasas:8.5, fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:20, nombre:"Queso chanco Colun",            marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:95,  prot:6,   carbs:1,   grasas:8,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀", precio:2490, pesoCompra:200},
  {id:21, nombre:"Queso mantecoso Colun",         marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:1,   grasas:8,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:22, nombre:"Queso laminado Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:25,  cal:80,  prot:5.5, carbs:0.5, grasas:6.5, fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:23, nombre:"Queso crema Philadelphia",      marca:"Kraft",        cat:"Lácteos",    porcion:30,  cal:90,  prot:2,   carbs:1.5, grasas:9,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:24, nombre:"Queso crema Soprole",           marca:"Soprole",      cat:"Lácteos",    porcion:30,  cal:85,  prot:2,   carbs:2,   grasas:8,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:25, nombre:"Ricotta Soprole",               marca:"Soprole",      cat:"Lácteos",    porcion:50,  cal:80,  prot:5,   carbs:2,   grasas:6,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:26, nombre:"Queso brie importado",          marca:"Genérico",     cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:0,   grasas:8.5, fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:27, nombre:"Queso parmesano rallado",       marca:"Genérico",     cat:"Lácteos",    porcion:15,  cal:55,  prot:5,   carbs:0,   grasas:4,   fibra:0, azucar:0.5, sodio:10,   emoji:"🧀"},
  {id:28, nombre:"Manjar Colun",                  marca:"Colun",        cat:"Lácteos",    porcion:15,  cal:55,  prot:1,   carbs:12,  grasas:0.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🍯"},
  {id:29, nombre:"Mantequilla Colun",             marca:"Colun",        cat:"Lácteos",    porcion:10,  cal:72,  prot:0.1, carbs:0,   grasas:8,   fibra:0, azucar:0, sodio:10,   emoji:"🧈"},
  {id:30, nombre:"Margarina Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:10,  cal:62,  prot:0,   carbs:0,   grasas:7,   fibra:0, azucar:0, sodio:10,   emoji:"🧈"},
  {id:31, nombre:"Crema Soprole",                 marca:"Soprole",      cat:"Lácteos",    porcion:100, cal:330, prot:2.5, carbs:3,   grasas:35,  fibra:0, azucar:3, sodio:10,   emoji:"🫙"},

  /* ── CARNES ── */
  {id:40, nombre:"Pechuga de pollo Ariztía",      marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:110, prot:23,  carbs:0,   grasas:1.5, fibra:0, azucar:0, sodio:60,   emoji:"🍗", precio:4990, pesoCompra:1000},
  {id:41, nombre:"Trutro de pollo Ariztía",       marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:185, prot:18,  carbs:0,   grasas:12,  fibra:0, azucar:0, sodio:60,   emoji:"🍗", precio:3490, pesoCompra:1000},
  {id:42, nombre:"Pechuga Super Pollo",           marca:"Super Pollo",  cat:"Carnes",     porcion:100, cal:108, prot:22,  carbs:0,   grasas:2,   fibra:0, azucar:0, sodio:60,   emoji:"🍗", precio:4790, pesoCompra:1000},
  {id:43, nombre:"Filete de pollo congelado",     marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:112, prot:22,  carbs:1,   grasas:2,   fibra:0, azucar:0, sodio:60,   emoji:"🍗", precio:4490, pesoCompra:1000},
  {id:44, nombre:"Filete de vacuno",              marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:27,  carbs:0,   grasas:7,   fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:45, nombre:"Lomo de vacuno",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:215, prot:26,  carbs:0,   grasas:12,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:46, nombre:"Asado de tira",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:24,  carbs:0,   grasas:17,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:47, nombre:"Palanca de vacuno",             marca:"Natural",      cat:"Carnes",     porcion:100, cal:180, prot:25,  carbs:0,   grasas:9,   fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:48, nombre:"Punta de ganso",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:160, prot:26,  carbs:0,   grasas:5.5, fibra:0, azucar:0, sodio:60,   emoji:"🥩", precio:5990, pesoCompra:1000},
  {id:49, nombre:"Punta picana",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:25,  carbs:0,   grasas:10,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:50, nombre:"Carne molida 80% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:255, prot:17,  carbs:0,   grasas:20,  fibra:0, azucar:0, sodio:45,   emoji:"🥩"},
  {id:51, nombre:"Carne molida 90% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:20,  carbs:0,   grasas:10,  fibra:0, azucar:0, sodio:50,   emoji:"🥩", precio:4990, pesoCompra:1000},
  {id:52, nombre:"Cerdo chuleta",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:24,  carbs:0,   grasas:10,  fibra:0, azucar:0, sodio:40,   emoji:"🥩"},
  {id:53, nombre:"Lomo de cerdo",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:165, prot:25,  carbs:0,   grasas:6.5, fibra:0, azucar:0, sodio:5,   emoji:"🥩"},
  {id:54, nombre:"Plateada de vacuno",            marca:"Natural",      cat:"Carnes",     porcion:100, cal:290, prot:22,  carbs:0,   grasas:22,  fibra:0, azucar:0, sodio:2,   emoji:"🥩"},
  {id:55, nombre:"Pavo pechuga",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:105, prot:24,  carbs:0,   grasas:1,   fibra:0, azucar:0, sodio:30,   emoji:"🍗", precio:5490, pesoCompra:1000},
  {id:56, nombre:"Cordero pierna",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:25,  carbs:0,   grasas:16,  fibra:0, azucar:0, sodio:2,   emoji:"🥩"},
  {id:57, nombre:"Hamburguesa vacuno 150g",       marca:"Genérico",     cat:"Carnes",     porcion:150, cal:380, prot:26,  carbs:0,   grasas:30,  fibra:0, azucar:0, sodio:5,   emoji:"🍔"},
  {id:58, nombre:"Hamburguesa pollo Ariztía 85g", marca:"Ariztía",      cat:"Carnes",     porcion:85,  cal:190, prot:14,  carbs:5,   grasas:13,  fibra:0, azucar:0, sodio:5,   emoji:"🍔"},

  /* ── CECINAS ── */
  {id:60, nombre:"Vienesa San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:40,  cal:130, prot:6,   carbs:2,   grasas:11,  fibra:0, azucar:1, sodio:25,   emoji:"🌭"},
  {id:61, nombre:"Vienesa Otto Kunkel",           marca:"Otto Kunkel",  cat:"Cecinas",    porcion:40,  cal:135, prot:6,   carbs:2,   grasas:11.5,fibra:0, azucar:12, sodio:100,   emoji:"🌭"},
  {id:62, nombre:"Jamón de pavo San Jorge",       marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:30,  prot:5.5, carbs:0.5, grasas:0.7, fibra:0, azucar:0, sodio:700,   emoji:"🥩"},
  {id:63, nombre:"Jamón de cerdo San Jorge",      marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:50,  prot:5,   carbs:0.5, grasas:3,   fibra:0, azucar:10, sodio:700,   emoji:"🥩"},
  {id:64, nombre:"Mortadela San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:70,  prot:4,   carbs:2,   grasas:5.5, fibra:0, azucar:1, sodio:700,   emoji:"🥩"},
  {id:65, nombre:"Salame Montserrat",             marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:110, prot:7,   carbs:0.5, grasas:9,   fibra:0, azucar:0, sodio:700,   emoji:"🥩"},
  {id:66, nombre:"Jamón serrano Montserrat",      marca:"Montserrat",   cat:"Cecinas",    porcion:25,  cal:55,  prot:7,   carbs:0,   grasas:3,   fibra:0, azucar:0, sodio:700,   emoji:"🥩"},
  {id:67, nombre:"Paté hígado Montserrat",        marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:100, prot:5,   carbs:1,   grasas:9,   fibra:0, azucar:24, sodio:700,   emoji:"🫙"},
  {id:68, nombre:"Chorizo San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:50,  cal:165, prot:8,   carbs:2,   grasas:14,  fibra:0, azucar:1, sodio:700,   emoji:"🌭"},
  {id:69, nombre:"Tocino ahumado",                marca:"Genérico",     cat:"Cecinas",    porcion:30,  cal:130, prot:5,   carbs:0.5, grasas:12,  fibra:0, azucar:0, sodio:700,   emoji:"🥓"},
  {id:70, nombre:"Pepperoni San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:30,  cal:120, prot:6,   carbs:1,   grasas:10,  fibra:0, azucar:0, sodio:700,   emoji:"🥩"},

  /* ── PANES ── */
  {id:80, nombre:"Marraqueta",                    marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:230, prot:7,   carbs:44,  grasas:2.5, fibra:2, azucar:2, sodio:380,   emoji:"🍞", precio:190, pesoCompra:80},
  {id:81, nombre:"Hallulla",                      marca:"Artesanal",    cat:"Panes",      porcion:70,  cal:200, prot:6,   carbs:38,  grasas:3,   fibra:1.5, azucar:2, sodio:380, emoji:"🫓"},
  {id:82, nombre:"Pan molde blanco Harry's",      marca:"Harry's",      cat:"Panes",      porcion:30,  cal:75,  prot:2.5, carbs:14,  grasas:1,   fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:83, nombre:"Pan molde integral Harry's",    marca:"Harry's",      cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:0.8, fibra:2, azucar:2, sodio:380,   emoji:"🍞", precio:2290, pesoCompra:500},
  {id:84, nombre:"Pan molde Bimbo blanco",        marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:72,  prot:2.5, carbs:14,  grasas:0.8, fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:85, nombre:"Pan molde Bimbo integral",      marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:1,   fibra:2.5, azucar:2, sodio:380, emoji:"🍞", precio:2090, pesoCompra:480},
  {id:86, nombre:"Pan de molde sin gluten Schär", marca:"Schär",        cat:"Panes",      porcion:35,  cal:90,  prot:2.5, carbs:17,  grasas:1.5, fibra:1, azucar:2, sodio:380,   emoji:"🍞"},
  {id:87, nombre:"Pan pita Ideal",                marca:"Ideal",        cat:"Panes",      porcion:60,  cal:155, prot:5,   carbs:30,  grasas:1.5, fibra:1, azucar:2, sodio:380,   emoji:"🫓"},
  {id:88, nombre:"Pan ciabatta",                  marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:215, prot:7,   carbs:41,  grasas:2,   fibra:1.5, azucar:2, sodio:380, emoji:"🥖"},
  {id:89, nombre:"Baguette",                      marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:220, prot:7,   carbs:43,  grasas:1.5, fibra:1.5, azucar:2, sodio:380, emoji:"🥖"},
  {id:90, nombre:"Sopaipilla",                    marca:"Artesanal",    cat:"Panes",      porcion:60,  cal:155, prot:3,   carbs:22,  grasas:6.5, fibra:1, azucar:2, sodio:380,   emoji:"🫓"},
  {id:91, nombre:"Tostadas de agua Luchetti",     marca:"Luchetti",     cat:"Panes",      porcion:20,  cal:75,  prot:2,   carbs:15,  grasas:0.5, fibra:0.5, azucar:2, sodio:380, emoji:"🍘"},
  {id:92, nombre:"Galletas de arroz Galletas",    marca:"Genérico",     cat:"Panes",      porcion:20,  cal:72,  prot:1.5, carbs:15,  grasas:0.5, fibra:0.5, azucar:2, sodio:380, emoji:"🍘"},
  {id:93, nombre:"Pan de centeno",                marca:"Artesanal",    cat:"Panes",      porcion:35,  cal:85,  prot:3,   carbs:16,  grasas:0.8, fibra:2.5, azucar:2, sodio:380, emoji:"🍞"},

  /* ── CEREALES ── */
  {id:100,nombre:"Avena Quaker tradicional",      marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:170, prot:6,   carbs:30,  grasas:3,   fibra:4, azucar:8, sodio:290,   emoji:"🌾", precio:1590, pesoCompra:1000},
  {id:101,nombre:"Avena instantánea Quaker",      marca:"Quaker",       cat:"Cereales",   porcion:35,  cal:130, prot:4.5, carbs:23,  grasas:2.5, fibra:3, azucar:18, sodio:180,   emoji:"🌾"},
  {id:102,nombre:"Musli Quaker",                  marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:175, prot:4.5, carbs:32,  grasas:3.5, fibra:3.5, azucar:25, sodio:80, emoji:"🥣"},
  {id:103,nombre:"Granola Quaker miel",           marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:195, prot:4,   carbs:34,  grasas:5,   fibra:3, azucar:1, sodio:5,   emoji:"🥣"},
  {id:104,nombre:"Corn Flakes Nestlé",            marca:"Nestlé",       cat:"Cereales",   porcion:30,  cal:110, prot:2.5, carbs:25,  grasas:0.2, fibra:0.8, azucar:6, sodio:100, emoji:"🥣"},
  {id:105,nombre:"Fitness Nestlé",                marca:"Nestlé",       cat:"Cereales",   porcion:30,  cal:110, prot:3,   carbs:23,  grasas:0.8, fibra:1.5, azucar:22, sodio:200, emoji:"🥣"},
  {id:106,nombre:"Zucaritas Kellogg's",           marca:"Kellogg's",    cat:"Cereales",   porcion:30,  cal:115, prot:1.5, carbs:27,  grasas:0.2, fibra:0.5, azucar:10, sodio:200, emoji:"🐯"},
  {id:107,nombre:"Special K Kellogg's",           marca:"Kellogg's",    cat:"Cereales",   porcion:30,  cal:110, prot:3.5, carbs:22,  grasas:0.5, fibra:1, azucar:20, sodio:200,   emoji:"🥣"},
  {id:108,nombre:"Milo Nestlé polvo",             marca:"Nestlé",       cat:"Cereales",   porcion:20,  cal:80,  prot:3,   carbs:15,  grasas:1.2, fibra:0.5, azucar:15, sodio:200, emoji:"🍫"},
  {id:109,nombre:"Granola sin azúcar",            marca:"Genérico",     cat:"Cereales",   porcion:45,  cal:185, prot:5,   carbs:28,  grasas:7,   fibra:4, azucar:12, sodio:200,   emoji:"🥣"},
  {id:110,nombre:"Weetabix",                      marca:"Weetabix",     cat:"Cereales",   porcion:37,  cal:130, prot:4.5, carbs:26,  grasas:0.7, fibra:3.5, azucar:12, sodio:200, emoji:"🥣"},

  /* ── SNACKS ── */
  {id:120,nombre:"Alfajor Costa",                 marca:"Costa",        cat:"Snacks",     porcion:42,  cal:190, prot:2.5, carbs:28,  grasas:8,   fibra:0.5, azucar:2, sodio:380, emoji:"🍪"},
  {id:121,nombre:"Galletas Tritón Costa",         marca:"Costa",        cat:"Snacks",     porcion:30,  cal:145, prot:1.5, carbs:21,  grasas:6,   fibra:0.5, azucar:2, sodio:450, emoji:"🍪"},
  {id:122,nombre:"Chocman Costa",                 marca:"Costa",        cat:"Snacks",     porcion:42,  cal:180, prot:2,   carbs:26,  grasas:8,   fibra:0.5, azucar:1.5, sodio:400, emoji:"🍫"},
  {id:123,nombre:"Turrón de Viena Costa",         marca:"Costa",        cat:"Snacks",     porcion:30,  cal:125, prot:1.5, carbs:20,  grasas:4.5, fibra:0.5, azucar:3, sodio:480, emoji:"🍫"},
  {id:124,nombre:"Oreo",                          marca:"Nabisco",      cat:"Snacks",     porcion:34,  cal:160, prot:1.5, carbs:25,  grasas:7,   fibra:0.5, azucar:4, sodio:380, emoji:"🍪"},
  {id:125,nombre:"Papas fritas Lays clásicas",    marca:"Lays",         cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:15,  grasas:10,  fibra:1, azucar:2, sodio:250,   emoji:"🥔"},
  {id:126,nombre:"Papas fritas Lays Max",         marca:"Lays",         cat:"Snacks",     porcion:28,  cal:155, prot:2,   carbs:14,  grasas:11,  fibra:1, azucar:2, sodio:250,   emoji:"🥔"},
  {id:127,nombre:"Pringles original",             marca:"Pringles",     cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:16,  grasas:9,   fibra:1, azucar:1.5, sodio:250,   emoji:"🥔"},
  {id:128,nombre:"Doritos nacho",                 marca:"Doritos",      cat:"Snacks",     porcion:28,  cal:140, prot:2,   carbs:18,  grasas:7,   fibra:1.5, azucar:5, sodio:250, emoji:"🌽"},
  {id:129,nombre:"Cheetos",                       marca:"Cheetos",      cat:"Snacks",     porcion:28,  cal:150, prot:2,   carbs:15,  grasas:10,  fibra:0.5, azucar:18, sodio:250, emoji:"🧡"},
  {id:130,nombre:"Kuchen artesanal",              marca:"Artesanal",    cat:"Snacks",     porcion:80,  cal:340, prot:5,   carbs:42,  grasas:17,  fibra:1, azucar:18, sodio:250,   emoji:"🥧"},
  {id:131,nombre:"Maní tostado salado",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:175, prot:7,   carbs:6,   grasas:14,  fibra:2, azucar:18, sodio:250,   emoji:"🥜"},
  {id:132,nombre:"Almendras naturales",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:175, prot:6,   carbs:6,   grasas:15,  fibra:3.5, azucar:18, sodio:250, emoji:"🥜"},
  {id:133,nombre:"Nueces",                        marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:195, prot:4.5, carbs:4,   grasas:19,  fibra:2, azucar:18, sodio:250,   emoji:"🥜"},
  {id:134,nombre:"Pistachos",                     marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:170, prot:6,   carbs:8,   grasas:14,  fibra:3, azucar:18, sodio:250,   emoji:"🥜"},
  {id:135,nombre:"Pasas",                         marca:"Genérico",     cat:"Snacks",     porcion:40,  cal:120, prot:1,   carbs:32,  grasas:0.2, fibra:1.5, azucar:18, sodio:250, emoji:"🍇"},
  {id:136,nombre:"Mix de frutos secos",           marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:170, prot:4,   carbs:12,  grasas:13,  fibra:2, azucar:18, sodio:250,   emoji:"🥜"},
  {id:137,nombre:"Barra cereal Quaker",           marca:"Quaker",       cat:"Snacks",     porcion:35,  cal:130, prot:2,   carbs:25,  grasas:3,   fibra:1.5, azucar:18, sodio:250, emoji:"🍫"},
  {id:138,nombre:"Galletas María Luchetti",       marca:"Luchetti",     cat:"Snacks",     porcion:30,  cal:125, prot:2,   carbs:22,  grasas:3.5, fibra:0.5, azucar:18, sodio:250, emoji:"🍪"},
  {id:139,nombre:"Chocolate Sahne-Nuss",          marca:"Sahne-Nuss",   cat:"Snacks",     porcion:40,  cal:215, prot:4,   carbs:22,  grasas:13,  fibra:1.5, azucar:18, sodio:250, emoji:"🍫"},
  {id:140,nombre:"Chocolate Costa bitter 70%",    marca:"Costa",        cat:"Snacks",     porcion:30,  cal:165, prot:3,   carbs:14,  grasas:12,  fibra:2.5, azucar:18, sodio:250, emoji:"🍫"},

  /* ── BEBIDAS ── */
  {id:150,nombre:"Coca-Cola lata 350ml",          marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:148, prot:0,   carbs:37,  grasas:0,   fibra:0, azucar:10, sodio:20,   emoji:"🥤"},
  {id:151,nombre:"Coca-Cola Zero lata 350ml",     marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0, azucar:12, sodio:20,   emoji:"🥤"},
  {id:152,nombre:"Pepsi lata 350ml",              marca:"Pepsi",        cat:"Bebidas",    porcion:350, cal:145, prot:0,   carbs:36,  grasas:0,   fibra:0, azucar:8, sodio:20,   emoji:"🥤"},
  {id:153,nombre:"Fanta naranja lata 350ml",      marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:165, prot:0,   carbs:41,  grasas:0,   fibra:0, azucar:9, sodio:20,   emoji:"🥤"},
  {id:154,nombre:"Sprite lata 350ml",             marca:"Coca-Cola",    cat:"Bebidas",    porcion:350, cal:145, prot:0,   carbs:36,  grasas:0,   fibra:0, azucar:7, sodio:20,   emoji:"🥤"},
  {id:155,nombre:"Bilz lata 350ml",               marca:"CCU",          cat:"Bebidas",    porcion:350, cal:140, prot:0,   carbs:35,  grasas:0,   fibra:0, azucar:9, sodio:20,   emoji:"🥤"},
  {id:156,nombre:"Pap lata 350ml",                marca:"CCU",          cat:"Bebidas",    porcion:350, cal:130, prot:0,   carbs:33,  grasas:0,   fibra:0, azucar:5, sodio:20,   emoji:"🥤"},
  {id:157,nombre:"Gatorade 500ml",                marca:"Gatorade",     cat:"Bebidas",    porcion:500, cal:130, prot:0,   carbs:34,  grasas:0,   fibra:0, azucar:6, sodio:20,   emoji:"🏃"},
  {id:158,nombre:"Monster Energy 473ml",          marca:"Monster",      cat:"Bebidas",    porcion:473, cal:220, prot:0,   carbs:55,  grasas:0,   fibra:0, azucar:8, sodio:20,   emoji:"⚡"},
  {id:159,nombre:"Red Bull 250ml",                marca:"Red Bull",     cat:"Bebidas",    porcion:250, cal:115, prot:0,   carbs:28,  grasas:0,   fibra:0, azucar:10, sodio:20,   emoji:"🐂"},
  {id:160,nombre:"Cerveza Cristal lata 350ml",    marca:"CCU",          cat:"Bebidas",    porcion:350, cal:150, prot:1.5, carbs:14,  grasas:0,   fibra:0, azucar:3, sodio:20,   emoji:"🍺"},
  {id:161,nombre:"Cerveza Escudo lata 350ml",     marca:"CCU",          cat:"Bebidas",    porcion:350, cal:148, prot:1.5, carbs:13,  grasas:0,   fibra:0, azucar:15, sodio:20,   emoji:"🍺"},
  {id:162,nombre:"Cerveza Heineken 330ml",        marca:"Heineken",     cat:"Bebidas",    porcion:330, cal:150, prot:1.5, carbs:11,  grasas:0,   fibra:0, azucar:12, sodio:20,   emoji:"🍺"},
  {id:163,nombre:"Jugo Watts naranja 200ml",      marca:"Watts",        cat:"Bebidas",    porcion:200, cal:95,  prot:0.5, carbs:22,  grasas:0,   fibra:0, azucar:4, sodio:20,   emoji:"🧃"},
  {id:164,nombre:"Jugo Andina manzana 250ml",     marca:"Andina",       cat:"Bebidas",    porcion:250, cal:110, prot:0.5, carbs:26,  grasas:0,   fibra:0, azucar:4, sodio:20,   emoji:"🧃"},
  {id:165,nombre:"Jugo Watt's natural naranja",   marca:"Watt's",       cat:"Bebidas",    porcion:200, cal:88,  prot:1.5, carbs:20,  grasas:0,   fibra:0.5, azucar:13, sodio:20, emoji:"🍊"},
  {id:166,nombre:"Agua Cachantun 500ml",          marca:"Cachantun",    cat:"Bebidas",    porcion:500, cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0, azucar:9, sodio:20,   emoji:"💧"},
  {id:167,nombre:"Agua con gas Cachantun 500ml",  marca:"Cachantun",    cat:"Bebidas",    porcion:500, cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0, azucar:10, sodio:20,   emoji:"💧"},
  {id:168,nombre:"Café Nescafé negro",            marca:"Nestlé",       cat:"Bebidas",    porcion:240, cal:5,   prot:0.3, carbs:0.7, grasas:0,   fibra:0, azucar:8, sodio:20,   emoji:"☕"},
  {id:169,nombre:"Café con leche Nescafé",        marca:"Nestlé",       cat:"Bebidas",    porcion:240, cal:90,  prot:4,   carbs:12,  grasas:2.5, fibra:0, azucar:11, sodio:20,   emoji:"☕"},
  {id:170,nombre:"Té negro en bolsita",           marca:"Genérico",     cat:"Bebidas",    porcion:240, cal:2,   prot:0,   carbs:0.5, grasas:0,   fibra:0, azucar:5, sodio:20,   emoji:"🍵"},
  {id:171,nombre:"Vino tinto copa 150ml",         marca:"Genérico",     cat:"Bebidas",    porcion:150, cal:125, prot:0,   carbs:4,   grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🍷"},
  {id:172,nombre:"Vino blanco copa 150ml",        marca:"Genérico",     cat:"Bebidas",    porcion:150, cal:120, prot:0,   carbs:4,   grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🥂"},
  {id:173,nombre:"Kombucha GT's 480ml",           marca:"GT's",         cat:"Bebidas",    porcion:480, cal:50,  prot:0,   carbs:12,  grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🍶"},

  /* ── FRUTAS ── */
  {id:180,nombre:"Palta Hass",                    marca:"Natural",      cat:"Frutas",     porcion:80,  cal:130, prot:1.5, carbs:7,   grasas:12,  fibra:5, azucar:10, sodio:2,   emoji:"🥑", precio:1490, pesoCompra:500},
  {id:181,nombre:"Manzana fuji",                  marca:"Natural",      cat:"Frutas",     porcion:150, cal:80,  prot:0.5, carbs:20,  grasas:0.3, fibra:3, azucar:10, sodio:2,   emoji:"🍎", precio:1290, pesoCompra:1000},
  {id:182,nombre:"Plátano",                       marca:"Natural",      cat:"Frutas",     porcion:120, cal:105, prot:1.5, carbs:27,  grasas:0.3, fibra:3, azucar:10, sodio:2,   emoji:"🍌", precio:990, pesoCompra:1000},
  {id:183,nombre:"Naranja navel",                 marca:"Natural",      cat:"Frutas",     porcion:200, cal:90,  prot:2,   carbs:22,  grasas:0,   fibra:4, azucar:10, sodio:2,   emoji:"🍊"},
  {id:184,nombre:"Frutillas",                     marca:"Natural",      cat:"Frutas",     porcion:150, cal:50,  prot:1,   carbs:12,  grasas:0.5, fibra:3, azucar:10, sodio:2,   emoji:"🍓"},
  {id:185,nombre:"Uva red globe",                 marca:"Natural",      cat:"Frutas",     porcion:100, cal:70,  prot:0.7, carbs:18,  grasas:0.2, fibra:1, azucar:10, sodio:2,   emoji:"🍇"},
  {id:186,nombre:"Durazno",                       marca:"Natural",      cat:"Frutas",     porcion:130, cal:50,  prot:1,   carbs:13,  grasas:0.3, fibra:2, azucar:10, sodio:2,   emoji:"🍑"},
  {id:187,nombre:"Lúcuma",                        marca:"Natural",      cat:"Frutas",     porcion:100, cal:99,  prot:1.5, carbs:23,  grasas:0.5, fibra:2, azucar:10, sodio:2,   emoji:"🍋"},
  {id:188,nombre:"Kiwi",                          marca:"Natural",      cat:"Frutas",     porcion:80,  cal:50,  prot:1,   carbs:12,  grasas:0.4, fibra:2.5, azucar:10, sodio:2, emoji:"🥝"},
  {id:189,nombre:"Chirimoya",                     marca:"Natural",      cat:"Frutas",     porcion:100, cal:75,  prot:1.5, carbs:18,  grasas:0.5, fibra:2.5, azucar:10, sodio:2, emoji:"🍈"},
  {id:190,nombre:"Sandía",                        marca:"Natural",      cat:"Frutas",     porcion:200, cal:60,  prot:1,   carbs:15,  grasas:0.2, fibra:1, azucar:10, sodio:2,   emoji:"🍉"},
  {id:191,nombre:"Melón",                         marca:"Natural",      cat:"Frutas",     porcion:200, cal:68,  prot:1.5, carbs:16,  grasas:0.3, fibra:1.5, azucar:10, sodio:2, emoji:"🍈"},
  {id:192,nombre:"Arándanos",                     marca:"Natural",      cat:"Frutas",     porcion:100, cal:57,  prot:0.7, carbs:14,  grasas:0.3, fibra:2.5, azucar:10, sodio:2, emoji:"🫐"},
  {id:193,nombre:"Frambuesas",                    marca:"Natural",      cat:"Frutas",     porcion:100, cal:52,  prot:1,   carbs:12,  grasas:0.7, fibra:6.5, azucar:10, sodio:2, emoji:"🍓"},
  {id:194,nombre:"Pera",                          marca:"Natural",      cat:"Frutas",     porcion:150, cal:85,  prot:0.5, carbs:23,  grasas:0.2, fibra:4, azucar:10, sodio:2,   emoji:"🍐"},
  {id:195,nombre:"Ciruela",                       marca:"Natural",      cat:"Frutas",     porcion:80,  cal:38,  prot:0.5, carbs:10,  grasas:0.1, fibra:1.5, azucar:10, sodio:2, emoji:"🍑"},
  {id:196,nombre:"Mango",                         marca:"Natural",      cat:"Frutas",     porcion:150, cal:95,  prot:1,   carbs:25,  grasas:0.4, fibra:2.5, azucar:10, sodio:2, emoji:"🥭"},
  {id:197,nombre:"Piña",                          marca:"Natural",      cat:"Frutas",     porcion:150, cal:78,  prot:0.9, carbs:20,  grasas:0.2, fibra:2, azucar:10, sodio:2,   emoji:"🍍"},

  /* ── VERDURAS ── */
  {id:200,nombre:"Tomate",                        marca:"Natural",      cat:"Verduras",   porcion:120, cal:25,  prot:1,   carbs:5,   grasas:0.3, fibra:1.5, azucar:4,  sodio:6,   emoji:"🍅", precio:990, pesoCompra:1000},
  {id:201,nombre:"Lechuga romana",                marca:"Natural",      cat:"Verduras",   porcion:80,  cal:14,  prot:1,   carbs:2,   grasas:0.2, fibra:1.5, azucar:1,  sodio:8,  emoji:"🥬", precio:790, pesoCompra:300},
  {id:202,nombre:"Espinaca",                      marca:"Natural",      cat:"Verduras",   porcion:80,  cal:18,  prot:2.5, carbs:2,   grasas:0.3, fibra:1.5, azucar:38, sodio:20, emoji:"🥬", precio:590, pesoCompra:200},
  {id:203,nombre:"Choclo",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:65,  prot:2,   carbs:14,  grasas:0.7, fibra:1.5, azucar:25, sodio:20, emoji:"🌽"},
  {id:204,nombre:"Zanahoria",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:41,  prot:0.9, carbs:10,  grasas:0.2, fibra:2.8, azucar:30, sodio:20, emoji:"🥕", precio:690, pesoCompra:1000},
  {id:205,nombre:"Cebolla",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:40,  prot:1,   carbs:9,   grasas:0.1, fibra:1.7, azucar:35, sodio:20, emoji:"🧅"},
  {id:206,nombre:"Papa blanca",                   marca:"Natural",      cat:"Verduras",   porcion:150, cal:120, prot:2.5, carbs:27,  grasas:0.2, fibra:2.5, azucar:1.5,sodio:10, emoji:"🥔", precio:790, pesoCompra:1000},
  {id:207,nombre:"Camote/batata",                 marca:"Natural",      cat:"Verduras",   porcion:150, cal:130, prot:2,   carbs:30,  grasas:0.2, fibra:4, azucar:22, sodio:20,   emoji:"🍠"},
  {id:208,nombre:"Brócoli",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:34,  prot:2.8, carbs:7,   grasas:0.4, fibra:2.6, azucar:28, sodio:20, emoji:"🥦"},
  {id:209,nombre:"Coliflor",                      marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:2,   carbs:5,   grasas:0.3, fibra:2, azucar:32, sodio:20,   emoji:"🥦"},
  {id:210,nombre:"Pepino",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.1, fibra:1, azucar:18, sodio:20,   emoji:"🥒"},
  {id:211,nombre:"Pimentón rojo",                 marca:"Natural",      cat:"Verduras",   porcion:120, cal:38,  prot:1.5, carbs:9,   grasas:0.3, fibra:3,   azucar:6,  sodio:4,    emoji:"🫑"},
  {id:212,nombre:"Pimentón verde",                marca:"Natural",      cat:"Verduras",   porcion:120, cal:30,  prot:1,   carbs:7,   grasas:0.2, fibra:2.5, azucar:3,  sodio:3,  emoji:"🫑"},
  {id:213,nombre:"Zapallo camote",                marca:"Natural",      cat:"Verduras",   porcion:100, cal:26,  prot:1,   carbs:6,   grasas:0.1, fibra:1.5, azucar:20, sodio:380, emoji:"🎃"},
  {id:214,nombre:"Berenjena",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:1,   carbs:6,   grasas:0.2, fibra:3, azucar:2, sodio:200,   emoji:"🍆"},
  {id:215,nombre:"Poroto verde",                  marca:"Natural",      cat:"Verduras",   porcion:100, cal:31,  prot:1.8, carbs:7,   grasas:0.1, fibra:2.7, azucar:1, sodio:20, emoji:"🫘", precio:890, pesoCompra:1000},
  {id:216,nombre:"Apio",                          marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.2, fibra:1.6, azucar:2, sodio:20, emoji:"🌿"},
  {id:217,nombre:"Champiñones",                   marca:"Natural",      cat:"Verduras",   porcion:100, cal:22,  prot:3,   carbs:3,   grasas:0.3, fibra:1, azucar:2, sodio:20,   emoji:"🍄"},
  {id:218,nombre:"Ajo",                           marca:"Natural",      cat:"Verduras",   porcion:10,  cal:15,  prot:0.6, carbs:3.4, grasas:0.1, fibra:0.2, azucar:2, sodio:20, emoji:"🧄"},

  /* ── LEGUMBRES ── */
  {id:225,nombre:"Lentejas cocidas Gallo",        marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:115, prot:9,   carbs:20,  grasas:0.4, fibra:8, azucar:1, sodio:5,   emoji:"🫘", precio:1890, pesoCompra:1000},
  {id:226,nombre:"Porotos negros Gallo",          marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:130, prot:9,   carbs:24,  grasas:0.5, fibra:7, azucar:1, sodio:5,   emoji:"🫘", precio:1690, pesoCompra:1000},
  {id:227,nombre:"Garbanzos cocidos",             marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:165, prot:9,   carbs:27,  grasas:2.5, fibra:8, azucar:1, sodio:5,   emoji:"🫘", precio:2290, pesoCompra:1000},
  {id:228,nombre:"Porotos blancos cocidos",       marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:125, prot:8.5, carbs:23,  grasas:0.4, fibra:7, azucar:1, sodio:5,   emoji:"🫘", precio:1690, pesoCompra:1000},
  {id:229,nombre:"Arvejas cocidas",               marca:"Natural",      cat:"Legumbres",  porcion:100, cal:84,  prot:5.5, carbs:15,  grasas:0.4, fibra:5, azucar:1, sodio:5,   emoji:"🫛"},
  {id:230,nombre:"Edamame",                       marca:"Natural",      cat:"Legumbres",  porcion:100, cal:121, prot:11,  carbs:10,  grasas:5,   fibra:5, azucar:1, sodio:5,   emoji:"🫛"},
  {id:231,nombre:"Hummus",                        marca:"Genérico",     cat:"Legumbres",  porcion:60,  cal:140, prot:5,   carbs:12,  grasas:8,   fibra:3.5, azucar:1, sodio:5, emoji:"🫙"},

  /* ── GRANOS / PASTAS / ARROZ ── */
  {id:235,nombre:"Arroz blanco cocido",           marca:"Genérico",     cat:"Granos",     porcion:100, cal:130, prot:2.7, carbs:28,  grasas:0.3, fibra:0.4, azucar:0.5, sodio:5, emoji:"🍚"},
  {id:236,nombre:"Arroz integral cocido",         marca:"Genérico",     cat:"Granos",     porcion:100, cal:110, prot:2.5, carbs:23,  grasas:0.8, fibra:1.8, azucar:0.5, sodio:5, emoji:"🍚"},
  {id:237,nombre:"Pasta Carozzi espagueti",       marca:"Carozzi",      cat:"Granos",     porcion:100, cal:360, prot:12,  carbs:72,  grasas:1.5, fibra:3, azucar:0.5, sodio:5,   emoji:"🍝", precio:890, pesoCompra:500},
  {id:238,nombre:"Pasta Carozzi cocida",          marca:"Carozzi",      cat:"Granos",     porcion:100, cal:160, prot:5.5, carbs:32,  grasas:0.9, fibra:2, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:239,nombre:"Pasta integral Carozzi",        marca:"Carozzi",      cat:"Granos",     porcion:100, cal:345, prot:13,  carbs:68,  grasas:2,   fibra:8, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:240,nombre:"Pasta integral cocida",         marca:"Carozzi",      cat:"Granos",     porcion:100, cal:150, prot:6,   carbs:30,  grasas:1,   fibra:4, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:241,nombre:"Quinoa cocida",                 marca:"Genérico",     cat:"Granos",     porcion:100, cal:120, prot:4.5, carbs:21,  grasas:2,   fibra:2.8, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:242,nombre:"Quinoa seca",                   marca:"Genérico",     cat:"Granos",     porcion:40,  cal:155, prot:6,   carbs:27,  grasas:2.5, fibra:3.5, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:243,nombre:"Avena seca",                    marca:"Genérico",     cat:"Granos",     porcion:40,  cal:150, prot:5,   carbs:26,  grasas:2.5, fibra:3.5, azucar:0.5, sodio:5, emoji:"🌾", precio:1390, pesoCompra:1000},
  {id:244,nombre:"Arroz seco Gallo",              marca:"Gallo",        cat:"Granos",     porcion:50,  cal:180, prot:3.5, carbs:40,  grasas:0.5, fibra:0.5, azucar:0.5, sodio:5, emoji:"🌾", precio:1290, pesoCompra:1000},
  {id:245,nombre:"Cous cous cocido",              marca:"Genérico",     cat:"Granos",     porcion:100, cal:112, prot:3.8, carbs:23,  grasas:0.2, fibra:1.5, azucar:0.5, sodio:5, emoji:"🌾"},

  /* ── PESCADOS / MARISCOS ── */
  {id:250,nombre:"Reineta al horno",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:115, prot:20,  carbs:0,   grasas:3.5, fibra:0, azucar:20, sodio:400,   emoji:"🐟"},
  {id:251,nombre:"Salmón fresco",                 marca:"Natural",      cat:"Pescados",   porcion:100, cal:200, prot:20,  carbs:0,   grasas:13,  fibra:0, azucar:5, sodio:160,   emoji:"🐟", precio:7990, pesoCompra:1000},
  {id:252,nombre:"Merluza al vapor",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:80,  prot:18,  carbs:0,   grasas:0.8, fibra:0, azucar:0, sodio:480,   emoji:"🐟", precio:3490, pesoCompra:1000},
  {id:253,nombre:"Congrio colorado",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:95,  prot:19,  carbs:0,   grasas:2,   fibra:0, azucar:15, sodio:80,   emoji:"🐟"},
  {id:254,nombre:"Jurel en conserva",             marca:"Genérico",     cat:"Pescados",   porcion:100, cal:150, prot:22,  carbs:0,   grasas:7,   fibra:0, azucar:0, sodio:80,   emoji:"🥫"},
  {id:255,nombre:"Atún Salmonte en agua",         marca:"Salmonte",     cat:"Pescados",   porcion:100, cal:100, prot:23,  carbs:0,   grasas:1,   fibra:0, azucar:0, sodio:80,   emoji:"🥫", precio:990, pesoCompra:140},
  {id:256,nombre:"Sardinas en aceite",            marca:"Genérico",     cat:"Pescados",   porcion:85,  cal:190, prot:23,  carbs:0,   grasas:11,  fibra:0, azucar:60, sodio:80,   emoji:"🥫", precio:890, pesoCompra:425},
  {id:257,nombre:"Machas al natural",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:55,  prot:10,  carbs:3,   grasas:0.5, fibra:0, azucar:0,  sodio:880,     emoji:"🦪"},
  {id:258,nombre:"Camarones cocidos",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:99,  prot:21,  carbs:0,   grasas:1,   fibra:0, azucar:0,  sodio:566,  emoji:"🦐"},
  {id:259,nombre:"Albacora (pez espada)",         marca:"Natural",      cat:"Pescados",   porcion:100, cal:145, prot:20,  carbs:0,   grasas:7,   fibra:0, azucar:0,  sodio:90,   emoji:"🐟"},
  {id:260,nombre:"Salmón ahumado",                marca:"Genérico",     cat:"Pescados",   porcion:50,  cal:85,  prot:11,  carbs:0,   grasas:4.5, fibra:0, azucar:82, sodio:40,   emoji:"🐟"},

  /* ── HUEVOS ── */
  {id:265,nombre:"Huevo entero grande",           marca:"Natural",      cat:"Huevos",     porcion:60,  cal:70,  prot:6,   carbs:0.5, grasas:5,   fibra:0, azucar:0, sodio:70,   emoji:"🥚", precio:2990, pesoCompra:720},
  {id:266,nombre:"Clara de huevo",                marca:"Natural",      cat:"Huevos",     porcion:30,  cal:17,  prot:3.5, carbs:0.2, grasas:0,   fibra:0, azucar:0.2, sodio:70,   emoji:"🥚"},
  {id:267,nombre:"Yema de huevo",                 marca:"Natural",      cat:"Huevos",     porcion:18,  cal:55,  prot:2.7, carbs:0.3, grasas:4.5, fibra:0, azucar:0.2, sodio:70,   emoji:"🥚"},
  {id:268,nombre:"Claras líquidas pasteurizadas", marca:"Genérico",     cat:"Huevos",     porcion:100, cal:52,  prot:11,  carbs:0.7, grasas:0.2, fibra:0, azucar:0.2, sodio:70,   emoji:"🥚"},

  /* ── ACEITES / GRASAS ── */
  {id:270,nombre:"Aceite de oliva extra virgen",  marca:"Chef",         cat:"Aceites",    porcion:15,  cal:135, prot:0,   carbs:0,   grasas:15,  fibra:0, azucar:0, sodio:0,   emoji:"🫙"},
  {id:271,nombre:"Aceite vegetal Mazola",         marca:"Mazola",       cat:"Aceites",    porcion:15,  cal:125, prot:0,   carbs:0,   grasas:14,  fibra:0, azucar:0, sodio:0,   emoji:"🫙"},
  {id:272,nombre:"Aceite de coco",                marca:"Genérico",     cat:"Aceites",    porcion:14,  cal:120, prot:0,   carbs:0,   grasas:14,  fibra:0, azucar:0, sodio:0,   emoji:"🥥"},
  {id:273,nombre:"Aceite de palta",               marca:"Genérico",     cat:"Aceites",    porcion:15,  cal:130, prot:0,   carbs:0,   grasas:14,  fibra:0, azucar:0, sodio:0,   emoji:"🥑"},

  /* ── COMIDAS CHILENAS ── */
  {id:280,nombre:"Empanada de pino horneada",     marca:"Artesanal",    cat:"Comidas CL", porcion:150, cal:360, prot:14,  carbs:38,  grasas:16,  fibra:2, azucar:2, sodio:450,   emoji:"🥟"},
  {id:281,nombre:"Empanada de queso horneada",    marca:"Artesanal",    cat:"Comidas CL", porcion:140, cal:310, prot:12,  carbs:35,  grasas:14,  fibra:1, azucar:2, sodio:450,   emoji:"🥟"},
  {id:282,nombre:"Empanada frita de queso",       marca:"Artesanal",    cat:"Comidas CL", porcion:140, cal:395, prot:12,  carbs:36,  grasas:22,  fibra:1, azucar:2, sodio:450,   emoji:"🥟"},
  {id:283,nombre:"Cazuela de vacuno",             marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:265, prot:22,  carbs:28,  grasas:7,   fibra:3, azucar:2, sodio:450,   emoji:"🍲"},
  {id:284,nombre:"Pastel de choclo",              marca:"Artesanal",    cat:"Comidas CL", porcion:300, cal:360, prot:15,  carbs:45,  grasas:14,  fibra:3, azucar:2, sodio:450,   emoji:"🫕"},
  {id:285,nombre:"Completo italiano",             marca:"Artesanal",    cat:"Comidas CL", porcion:250, cal:480, prot:15,  carbs:45,  grasas:26,  fibra:3, azucar:2, sodio:450,   emoji:"🌭"},
  {id:286,nombre:"Chorrillana individual",        marca:"Artesanal",    cat:"Comidas CL", porcion:450, cal:820, prot:30,  carbs:75,  grasas:44,  fibra:5, azucar:2, sodio:450,   emoji:"🍟"},
  {id:287,nombre:"Sopaipilla pasada",             marca:"Artesanal",    cat:"Comidas CL", porcion:80,  cal:180, prot:3,   carbs:32,  grasas:5,   fibra:1, azucar:2, sodio:450,   emoji:"🫓"},
  {id:288,nombre:"Mote con huesillos vaso",       marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:290, prot:4,   carbs:66,  grasas:0.5, fibra:3, azucar:2, sodio:450,   emoji:"🥤"},
  {id:289,nombre:"Humita",                        marca:"Artesanal",    cat:"Comidas CL", porcion:200, cal:210, prot:5,   carbs:38,  grasas:5,   fibra:3, azucar:2, sodio:450,   emoji:"🌽"},
  {id:290,nombre:"Charquicán",                    marca:"Artesanal",    cat:"Comidas CL", porcion:350, cal:290, prot:20,  carbs:38,  grasas:7,   fibra:5, azucar:2, sodio:450,   emoji:"🥘"},
  {id:291,nombre:"Porotos con riendas",           marca:"Artesanal",    cat:"Comidas CL", porcion:350, cal:320, prot:14,  carbs:55,  grasas:5,   fibra:12, azucar:2, sodio:450,  emoji:"🫘"},
  {id:292,nombre:"Arrollado de huaso",            marca:"Artesanal",    cat:"Comidas CL", porcion:80,  cal:180, prot:12,  carbs:2,   grasas:14,  fibra:0, azucar:2, sodio:450,   emoji:"🥩"},
  {id:293,nombre:"Prietas (100g)",                marca:"Artesanal",    cat:"Comidas CL", porcion:100, cal:280, prot:14,  carbs:8,   grasas:22,  fibra:0, azucar:2, sodio:450,   emoji:"🌑"},
  {id:294,nombre:"Milcao",                        marca:"Artesanal",    cat:"Comidas CL", porcion:100, cal:240, prot:4,   carbs:38,  grasas:9,   fibra:2, azucar:2, sodio:450,   emoji:"🫓"},
  {id:295,nombre:"Curanto en olla",               marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:520, prot:38,  carbs:40,  grasas:18,  fibra:4, azucar:2, sodio:450,   emoji:"🍲"},

  /* ── CONGELADOS ── */
  {id:300,nombre:"Nuggets de pollo Ariztía",      marca:"Ariztía",      cat:"Congelados", porcion:100, cal:240, prot:15,  carbs:16,  grasas:12,  fibra:0.5, azucar:2, sodio:580, emoji:"🍗"},
  {id:301,nombre:"Papas fritas congeladas McCain",marca:"McCain",       cat:"Congelados", porcion:100, cal:170, prot:2.5, carbs:25,  grasas:7,   fibra:2.5, azucar:1, sodio:650, emoji:"🍟"},
  {id:302,nombre:"Pizza Margherita congelada",    marca:"Genérico",     cat:"Congelados", porcion:150, cal:370, prot:14,  carbs:44,  grasas:15,  fibra:2, azucar:3, sodio:720,   emoji:"🍕"},
  {id:303,nombre:"Empanadas congeladas pino",     marca:"Genérico",     cat:"Congelados", porcion:150, cal:340, prot:12,  carbs:40,  grasas:14,  fibra:2, azucar:2, sodio:180,   emoji:"🥟"},
  {id:304,nombre:"Lasaña congelada",              marca:"Genérico",     cat:"Congelados", porcion:300, cal:390, prot:18,  carbs:40,  grasas:16,  fibra:2.5, azucar:1, sodio:450, emoji:"🍝"},
  {id:305,nombre:"Hamburguesa congelada Jumbo",   marca:"Jumbo",        cat:"Congelados", porcion:115, cal:280, prot:18,  carbs:5,   grasas:22,  fibra:0, azucar:0, sodio:350,   emoji:"🍔"},
  {id:306,nombre:"Brócoli congelado",             marca:"Genérico",     cat:"Congelados", porcion:100, cal:30,  prot:2.5, carbs:6,   grasas:0.3, fibra:2.5, azucar:1, sodio:350, emoji:"🥦"},
  {id:307,nombre:"Mix verduras congeladas",       marca:"Genérico",     cat:"Congelados", porcion:100, cal:55,  prot:3,   carbs:10,  grasas:0.3, fibra:3, azucar:0, sodio:350,   emoji:"🥦"},

  /* ── CONDIMENTOS ── */
  {id:310,nombre:"Azúcar Iansa",                  marca:"Iansa",        cat:"Condimentos",porcion:5,   cal:20,  prot:0,   carbs:5,   grasas:0,   fibra:0, azucar:1, sodio:300,   emoji:"🍬"},
  {id:311,nombre:"Miel de abeja natural",         marca:"Natural",      cat:"Condimentos",porcion:7,   cal:22,  prot:0,   carbs:6,   grasas:0,   fibra:0, azucar:4, sodio:300,   emoji:"🍯"},
  {id:312,nombre:"Mayonesa Hellmann's",           marca:"Hellmann's",   cat:"Condimentos",porcion:15,  cal:100, prot:0.1, carbs:0.5, grasas:11,  fibra:0, azucar:8, sodio:300,   emoji:"🫙"},
  {id:313,nombre:"Ketchup Malloa",                marca:"Malloa",       cat:"Condimentos",porcion:15,  cal:20,  prot:0.3, carbs:5,   grasas:0,   fibra:0.3, azucar:2, sodio:300, emoji:"🍅"},
  {id:314,nombre:"Mostaza Savora",                marca:"Savora",       cat:"Condimentos",porcion:10,  cal:12,  prot:0.5, carbs:1,   grasas:0.5, fibra:0.5, azucar:1, sodio:300, emoji:"🟡"},
  {id:315,nombre:"Mermelada Watts frutilla",      marca:"Watts",        cat:"Condimentos",porcion:20,  cal:45,  prot:0.1, carbs:11,  grasas:0,   fibra:0.3, azucar:8, sodio:300, emoji:"🍓"},
  {id:316,nombre:"Salsa de tomate Malloa",        marca:"Malloa",       cat:"Condimentos",porcion:50,  cal:30,  prot:1,   carbs:7,   grasas:0,   fibra:1, azucar:8, sodio:300,   emoji:"🫙"},
  {id:317,nombre:"Salsa de soya Kikkoman",        marca:"Kikkoman",     cat:"Condimentos",porcion:15,  cal:10,  prot:1,   carbs:1,   grasas:0,   fibra:0, azucar:8, sodio:300,   emoji:"🫙"},
  {id:318,nombre:"Vinagre de manzana",            marca:"Genérico",     cat:"Condimentos",porcion:15,  cal:3,   prot:0,   carbs:0.5, grasas:0,   fibra:0, azucar:8, sodio:300,   emoji:"🍶"},

  /* ── PREPARADOS / COMIDA RÁPIDA ── */
  {id:330,nombre:"Cheeseburger McDonald's",       marca:"McDonald's",   cat:"Comida rápida",porcion:119, cal:300, prot:15, carbs:32, grasas:12, fibra:2, azucar:5, sodio:600,  emoji:"🍔"},
  {id:331,nombre:"Big Mac McDonald's",            marca:"McDonald's",   cat:"Comida rápida",porcion:214, cal:550, prot:25, carbs:45, grasas:30, fibra:3, azucar:5, sodio:600,  emoji:"🍔"},
  {id:332,nombre:"McPollo McDonald's",            marca:"McDonald's",   cat:"Comida rápida",porcion:170, cal:400, prot:24, carbs:38, grasas:16, fibra:2, azucar:5, sodio:600,  emoji:"🍗"},
  {id:333,nombre:"Papas fritas McDonald's med.",  marca:"McDonald's",   cat:"Comida rápida",porcion:117, cal:320, prot:4,  carbs:44, grasas:15, fibra:3, azucar:5, sodio:600,  emoji:"🍟"},
  {id:334,nombre:"Completo Doggi's",              marca:"Doggi's",      cat:"Comida rápida",porcion:250, cal:490, prot:14, carbs:46, grasas:27, fibra:3, azucar:5, sodio:600,  emoji:"🌭"},
  {id:335,nombre:"Pizza Italiana porción",        marca:"Domino's",     cat:"Comida rápida",porcion:120, cal:270, prot:12, carbs:32, grasas:10, fibra:2, azucar:5, sodio:600,  emoji:"🍕"},
  {id:336,nombre:"Sushi roll 8 piezas",           marca:"Genérico",     cat:"Comida rápida",porcion:200, cal:300, prot:10, carbs:56, grasas:4,  fibra:2, azucar:5, sodio:600,  emoji:"🍱"},
  {id:337,nombre:"Shawarma de pollo",             marca:"Genérico",     cat:"Comida rápida",porcion:300, cal:520, prot:28, carbs:52, grasas:20, fibra:4, azucar:5, sodio:600,  emoji:"🫔"},
  {id:338,nombre:"Tacos de pollo (2 ud)",         marca:"Genérico",     cat:"Comida rápida",porcion:200, cal:380, prot:20, carbs:42, grasas:14, fibra:4, azucar:5, sodio:600,  emoji:"🌮"},

  /* ── LÁCTEOS ADICIONALES ── */
  {id:340,nombre:"Leche condensada Nestlé",       marca:"Nestlé",       cat:"Lácteos",      porcion:40,  cal:130, prot:3,  carbs:22, grasas:3.5,fibra:0, azucar:4.5, sodio:10,  emoji:"🥛"},
  {id:341,nombre:"Leche en polvo Nido",           marca:"Nestlé",       cat:"Lácteos",      porcion:26,  cal:115, prot:5,  carbs:14, grasas:4,  fibra:0, azucar:4.5, sodio:10,  emoji:"🥛"},
  {id:342,nombre:"Yogurt Activia Danone",         marca:"Danone",       cat:"Lácteos",      porcion:125, cal:90,  prot:4,  carbs:13, grasas:2.5,fibra:0, azucar:4.5, sodio:10,  emoji:"🥣"},
  {id:343,nombre:"Cheddar laminado",              marca:"Genérico",     cat:"Lácteos",      porcion:20,  cal:67,  prot:4,  carbs:0.5,grasas:5.5,fibra:0, azucar:4.5, sodio:10,  emoji:"🧀"},

  /* ── PANES ADICIONALES ── */
  {id:345,nombre:"Croissant mantequilla",         marca:"Artesanal",    cat:"Panes",        porcion:60,  cal:230, prot:5,  carbs:26, grasas:12, fibra:1, azucar:2, sodio:380,  emoji:"🥐"},
  {id:346,nombre:"Muffin inglés",                 marca:"Artesanal",    cat:"Panes",        porcion:55,  cal:130, prot:4.5,carbs:26, grasas:1,  fibra:1.5, azucar:2, sodio:380,emoji:"🫓"},
  {id:347,nombre:"Bagel natural",                 marca:"Artesanal",    cat:"Panes",        porcion:98,  cal:270, prot:10, carbs:52, grasas:1.5,fibra:2, azucar:2, sodio:380,  emoji:"🥯"},
  {id:348,nombre:"Tortilla de trigo grande",      marca:"Genérico",     cat:"Panes",        porcion:45,  cal:140, prot:4,  carbs:24, grasas:3,  fibra:1, azucar:2, sodio:380,  emoji:"🫓"},

  /* ── SNACKS ADICIONALES ── */
  {id:350,nombre:"Hummus con tostadas (porción)", marca:"Genérico",     cat:"Snacks",       porcion:80,  cal:180, prot:6,  carbs:20, grasas:8,  fibra:4, azucar:18, sodio:250,  emoji:"🥙"},
  {id:351,nombre:"Palomitas de maíz naturales",   marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:110, prot:3,  carbs:22, grasas:1.5,fibra:3, azucar:18, sodio:250,  emoji:"🍿"},
  {id:352,nombre:"Palomitas mantequilla",         marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:150, prot:2,  carbs:18, grasas:8,  fibra:2, azucar:18, sodio:250,  emoji:"🍿"},
  {id:353,nombre:"Chocolate blanco Nestlé",       marca:"Nestlé",       cat:"Snacks",       porcion:30,  cal:160, prot:2,  carbs:18, grasas:9,  fibra:0, azucar:18, sodio:250,  emoji:"🍫"},
  {id:354,nombre:"Marshmallows",                  marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:95,  prot:1,  carbs:23, grasas:0,  fibra:0, azucar:18, sodio:250,  emoji:"☁️"},
  {id:355,nombre:"Semillas de chía",              marca:"Genérico",     cat:"Snacks",       porcion:15,  cal:68,  prot:2.5,carbs:5,  grasas:4.5,fibra:5, azucar:18, sodio:250,  emoji:"🌱"},
  {id:356,nombre:"Semillas de girasol",           marca:"Genérico",     cat:"Snacks",       porcion:30,  cal:175, prot:6,  carbs:6,  grasas:14, fibra:2, azucar:18, sodio:250,  emoji:"🌻"},

  /* ── BEBIDAS ADICIONALES ── */
  {id:360,nombre:"Jugo natural naranja casero",   marca:"Natural",      cat:"Bebidas",      porcion:250, cal:110, prot:1.5,carbs:26, grasas:0,  fibra:0.5, azucar:28, sodio:20,emoji:"🍊"},
  {id:361,nombre:"Batido proteico comercial",     marca:"Genérico",     cat:"Bebidas",      porcion:330, cal:160, prot:20, carbs:15, grasas:3,  fibra:2, azucar:28, sodio:20,  emoji:"🥤"},
  {id:362,nombre:"Leche con chocolate Soprole",   marca:"Soprole",      cat:"Bebidas",      porcion:250, cal:195, prot:8,  carbs:30, grasas:4.5,fibra:0, azucar:28, sodio:20,  emoji:"🍫"},
  {id:363,nombre:"Limonada natural (vaso)",       marca:"Natural",      cat:"Bebidas",      porcion:300, cal:80,  prot:0.5,carbs:22, grasas:0,  fibra:0, azucar:28, sodio:20,  emoji:"🍋"},
  {id:364,nombre:"Smoothie frutas natural",       marca:"Natural",      cat:"Bebidas",      porcion:300, cal:150, prot:2,  carbs:36, grasas:0.5,fibra:3, azucar:28, sodio:20,  emoji:"🥤"},
  {id:365,nombre:"Agua de coco natural",          marca:"Natural",      cat:"Bebidas",      porcion:300, cal:60,  prot:1,  carbs:15, grasas:0.5,fibra:0, azucar:28, sodio:20,  emoji:"🥥"},
  {id:366,nombre:"Cerveza sin alcohol",           marca:"Genérico",     cat:"Bebidas",      porcion:330, cal:70,  prot:0.5,carbs:12, grasas:0,  fibra:0, azucar:28, sodio:20,  emoji:"🍺"},

  /* ── SALSAS Y ADEREZOS ── */
  {id:370,nombre:"Aceite oliva + limón (vinagreta)",marca:"Natural",    cat:"Condimentos",  porcion:20,  cal:85,  prot:0,  carbs:1,  grasas:9,  fibra:0, azucar:8, sodio:300,  emoji:"🫙"},
  {id:371,nombre:"Salsa tzatziki",                marca:"Genérico",     cat:"Condimentos",  porcion:30,  cal:35,  prot:2,  carbs:3,  grasas:1.5,fibra:0, azucar:8, sodio:300,  emoji:"🫙"},
  {id:372,nombre:"Guacamole",                     marca:"Natural",      cat:"Condimentos",  porcion:60,  cal:95,  prot:1.5,carbs:5,  grasas:8.5,fibra:3.5, azucar:8, sodio:300,emoji:"🥑"},
  {id:373,nombre:"Tahini (pasta sésamo)",         marca:"Genérico",     cat:"Condimentos",  porcion:15,  cal:90,  prot:2.5,carbs:3,  grasas:8,  fibra:1, azucar:8, sodio:300,  emoji:"🫙"},
  {id:374,nombre:"Pesto",                         marca:"Genérico",     cat:"Condimentos",  porcion:30,  cal:120, prot:3,  carbs:2,  grasas:12, fibra:0.5, azucar:8, sodio:300,emoji:"🌿"},

  /* ── PROTEÍNAS / PREPARACIONES ── */
  {id:380,nombre:"Filete pollo a la plancha",     marca:"Natural",      cat:"Preparados",   porcion:150, cal:165, prot:34, carbs:0,  grasas:3,  fibra:0, azucar:3, sodio:400,  emoji:"🍗"},
  {id:381,nombre:"Salmón al horno",               marca:"Natural",      cat:"Preparados",   porcion:150, cal:300, prot:30, carbs:0,  grasas:20, fibra:0, azucar:3, sodio:400,  emoji:"🐟"},
  {id:382,nombre:"Huevos revueltos (2 huevos)",   marca:"Natural",      cat:"Preparados",   porcion:120, cal:180, prot:13, carbs:1,  grasas:14, fibra:0, azucar:3, sodio:400,  emoji:"🍳"},
  {id:383,nombre:"Omelette 3 huevos",             marca:"Natural",      cat:"Preparados",   porcion:180, cal:270, prot:20, carbs:1,  grasas:21, fibra:0, azucar:3, sodio:400,  emoji:"🍳"},
  {id:384,nombre:"Vacuno a la plancha",           marca:"Natural",      cat:"Preparados",   porcion:150, cal:260, prot:40, carbs:0,  grasas:11, fibra:0, azucar:3, sodio:400,  emoji:"🥩"},
  {id:385,nombre:"Arroz con leche (porción)",     marca:"Artesanal",    cat:"Preparados",   porcion:200, cal:240, prot:5,  carbs:42, grasas:6,  fibra:0.5, azucar:3, sodio:400,emoji:"🍚"},
  {id:386,nombre:"Ensalada César con pollo",      marca:"Natural",      cat:"Preparados",   porcion:300, cal:380, prot:28, carbs:18, grasas:22, fibra:4, azucar:3, sodio:400,  emoji:"🥗"},
  {id:387,nombre:"Ensalada mixta simple",         marca:"Natural",      cat:"Preparados",   porcion:200, cal:60,  prot:2,  carbs:10, grasas:1,  fibra:4, azucar:3, sodio:400,  emoji:"🥗"},
  {id:388,nombre:"Puré de papa con mantequilla",  marca:"Natural",      cat:"Preparados",   porcion:200, cal:240, prot:4,  carbs:36, grasas:9,  fibra:3, azucar:3, sodio:400,  emoji:"🥔"},
  {id:389,nombre:"Sopa de verduras casera",       marca:"Natural",      cat:"Preparados",   porcion:350, cal:120, prot:5,  carbs:22, grasas:2,  fibra:4, azucar:3, sodio:400,  emoji:"🍲"},

  /* ── MARCA LÍDER / JUMBO / UNIMARC ── */
  {id:400,nombre:"Pan molde Líder blanco",          marca:"Líder",        cat:"Panes",      porcion:30,  cal:72,  prot:2.5, carbs:14,  grasas:0.8, fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:401,nombre:"Pan molde Líder integral",        marca:"Líder",        cat:"Panes",      porcion:30,  cal:66,  prot:3,   carbs:12,  grasas:0.8, fibra:2.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:402,nombre:"Leche entera Líder",              marca:"Líder",        cat:"Lácteos",    porcion:250, cal:155, prot:8,   carbs:12,  grasas:8.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🥛"},
  {id:403,nombre:"Yogurt natural Líder",            marca:"Líder",        cat:"Lácteos",    porcion:150, cal:115, prot:6,   carbs:14,  grasas:3.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🥣"},
  {id:404,nombre:"Arroz grano largo Líder",         marca:"Líder",        cat:"Granos",     porcion:50,  cal:178, prot:3.5, carbs:39,  grasas:0.4, fibra:0.5, azucar:0.5, sodio:5, emoji:"🍚", precio:1190, pesoCompra:1000},
  {id:405,nombre:"Aceite maravilla Líder",          marca:"Líder",        cat:"Aceites",    porcion:15,  cal:124, prot:0,   carbs:0,   grasas:14,  fibra:0, azucar:0, sodio:0,   emoji:"🫙"},
  {id:406,nombre:"Azúcar Líder",                    marca:"Líder",        cat:"Condimentos",porcion:5,   cal:20,  prot:0,   carbs:5,   grasas:0,   fibra:0, azucar:8, sodio:300,   emoji:"🍬"},
  {id:407,nombre:"Fideos Líder espagueti",          marca:"Líder",        cat:"Granos",     porcion:80,  cal:288, prot:10,  carbs:57,  grasas:1.5, fibra:2.5, azucar:0.5, sodio:5, emoji:"🍝"},
  {id:408,nombre:"Atún Líder al agua",              marca:"Líder",        cat:"Pescados",   porcion:100, cal:98,  prot:22,  carbs:0,   grasas:1,   fibra:0, azucar:0, sodio:80,   emoji:"🥫", precio:890, pesoCompra:140},
  {id:409,nombre:"Porotos negros Líder",            marca:"Líder",        cat:"Legumbres",  porcion:100, cal:127, prot:8.5, carbs:23,  grasas:0.5, fibra:7, azucar:1, sodio:5,   emoji:"🫘", precio:1490, pesoCompra:1000},
  {id:410,nombre:"Granola Líder con miel",          marca:"Líder",        cat:"Cereales",   porcion:45,  cal:188, prot:4,   carbs:32,  grasas:5.5, fibra:3, azucar:12, sodio:200,   emoji:"🥣"},
  {id:411,nombre:"Leche condensada Líder",          marca:"Líder",        cat:"Lácteos",    porcion:40,  cal:128, prot:3,   carbs:22,  grasas:3.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🥛"},
  {id:412,nombre:"Mantequilla Líder con sal",       marca:"Líder",        cat:"Lácteos",    porcion:10,  cal:71,  prot:0.1, carbs:0,   grasas:8,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧈"},
  {id:413,nombre:"Mote Unimarc",                    marca:"Unimarc",      cat:"Granos",     porcion:100, cal:155, prot:4,   carbs:33,  grasas:0.8, fibra:2, azucar:0.5, sodio:5,   emoji:"🌾"},
  {id:414,nombre:"Lentejas Unimarc",                marca:"Unimarc",      cat:"Legumbres",  porcion:60,  cal:202, prot:14,  carbs:33,  grasas:0.8, fibra:11, azucar:1, sodio:5,  emoji:"🫘", precio:1790, pesoCompra:1000},
  {id:415,nombre:"Avena Unimarc",                   marca:"Unimarc",      cat:"Cereales",   porcion:45,  cal:168, prot:5.5, carbs:30,  grasas:2.8, fibra:4, azucar:12, sodio:200,   emoji:"🌾"},
  {id:416,nombre:"Mermelada frutilla Unimarc",      marca:"Unimarc",      cat:"Condimentos",porcion:20,  cal:44,  prot:0.1, carbs:11,  grasas:0,   fibra:0.3, azucar:8, sodio:300, emoji:"🍓"},
  {id:417,nombre:"Leche entera Santa Isabel",       marca:"Santa Isabel", cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:12,  grasas:9,   fibra:0, azucar:4.5, sodio:10,   emoji:"🥛"},
  {id:418,nombre:"Pan marraqueta Santa Isabel",     marca:"Santa Isabel", cat:"Panes",      porcion:80,  cal:225, prot:7,   carbs:43,  grasas:2.5, fibra:2, azucar:2, sodio:380,   emoji:"🍞"},
  {id:419,nombre:"Pollo entero Jumbo",              marca:"Jumbo",        cat:"Carnes",     porcion:100, cal:172, prot:20,  carbs:0,   grasas:10,  fibra:0, azucar:0, sodio:60,   emoji:"🍗"},
  {id:420,nombre:"Hamburguesa vacuno Jumbo 4pack",  marca:"Jumbo",        cat:"Carnes",     porcion:115, cal:285, prot:20,  carbs:1,   grasas:22,  fibra:0, azucar:0, sodio:60,   emoji:"🍔"},

  /* ── COMIDA RÁPIDA CHILENA MÁS COMPLETA ── */
  {id:430,nombre:"Sopaipilla con pebre",            marca:"Artesanal",    cat:"Comidas CL", porcion:80,  cal:198, prot:3.5, carbs:28,  grasas:8,   fibra:1.5, azucar:2, sodio:450, emoji:"🫓"},
  {id:431,nombre:"Cazuela de pollo",                marca:"Artesanal",    cat:"Comidas CL", porcion:400, cal:245, prot:22,  carbs:26,  grasas:6,   fibra:3, azucar:2, sodio:450,   emoji:"🍲"},
  {id:432,nombre:"Chupe de locos",                  marca:"Artesanal",    cat:"Comidas CL", porcion:300, cal:380, prot:24,  carbs:22,  grasas:18,  fibra:1, azucar:2, sodio:450,   emoji:"🍲"},
  {id:433,nombre:"Pantrucas",                       marca:"Artesanal",    cat:"Comidas CL", porcion:350, cal:295, prot:12,  carbs:42,  grasas:8,   fibra:3, azucar:2, sodio:450,   emoji:"🍲"},
  {id:434,nombre:"Choripán",                        marca:"Artesanal",    cat:"Comidas CL", porcion:180, cal:480, prot:18,  carbs:38,  grasas:26,  fibra:2, azucar:2, sodio:450,   emoji:"🌭"},
  {id:435,nombre:"Leche asada",                     marca:"Artesanal",    cat:"Comidas CL", porcion:150, cal:195, prot:7,   carbs:28,  grasas:6,   fibra:0, azucar:2, sodio:450,   emoji:"🍮"},
  {id:436,nombre:"Calzón roto",                     marca:"Artesanal",    cat:"Comidas CL", porcion:60,  cal:245, prot:3,   carbs:30,  grasas:13,  fibra:0.5, azucar:2, sodio:450, emoji:"🍩"},
  {id:437,nombre:"Manzana con canela horneada",     marca:"Natural",      cat:"Comidas CL", porcion:180, cal:120, prot:0.5, carbs:30,  grasas:0.5, fibra:3.5, azucar:2, sodio:450, emoji:"🍎"},
  {id:438,nombre:"Api morado",                      marca:"Artesanal",    cat:"Bebidas",    porcion:250, cal:145, prot:1,   carbs:35,  grasas:0.5, fibra:1, azucar:28, sodio:20,   emoji:"🫐"},
  {id:439,nombre:"Chicha de uva sin alcohol",       marca:"Artesanal",    cat:"Bebidas",    porcion:250, cal:155, prot:0.5, carbs:38,  grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🍇"},
  {id:440,nombre:"Longaniza a la parrilla",         marca:"Artesanal",    cat:"Carnes",     porcion:80,  cal:280, prot:12,  carbs:2,   grasas:24,  fibra:0, azucar:0, sodio:60,   emoji:"🌭"},
  {id:441,nombre:"Valdiviano",                      marca:"Artesanal",    cat:"Comidas CL", porcion:300, cal:210, prot:18,  carbs:15,  grasas:8,   fibra:2, azucar:2, sodio:450,   emoji:"🍲"},
  {id:442,nombre:"Milcao de papa",                  marca:"Artesanal",    cat:"Comidas CL", porcion:120, cal:265, prot:5,   carbs:42,  grasas:9,   fibra:2.5, azucar:2, sodio:450, emoji:"🫓"},
  {id:443,nombre:"Chapalele",                       marca:"Artesanal",    cat:"Comidas CL", porcion:100, cal:195, prot:3,   carbs:38,  grasas:3,   fibra:2, azucar:2, sodio:450,   emoji:"🫓"},
  {id:444,nombre:"Pebre (porción)",                 marca:"Natural",      cat:"Condimentos",porcion:50,  cal:28,  prot:0.8, carbs:5,   grasas:1,   fibra:1.5, azucar:8, sodio:300, emoji:"🌿"},
  {id:445,nombre:"Chancho en piedra",               marca:"Natural",      cat:"Condimentos",porcion:50,  cal:22,  prot:0.7, carbs:4,   grasas:0.8, fibra:1, azucar:8, sodio:300,   emoji:"🍅"},

  /* ── CAFETERÍA / PANADERÍA ── */
  {id:450,nombre:"Café de grano con leche",         marca:"Cafetería",    cat:"Bebidas",    porcion:200, cal:85,  prot:4,   carbs:9,   grasas:3.5, fibra:0, azucar:28, sodio:20,   emoji:"☕"},
  {id:451,nombre:"Cappuccino",                      marca:"Cafetería",    cat:"Bebidas",    porcion:180, cal:95,  prot:5,   carbs:10,  grasas:4,   fibra:0, azucar:28, sodio:20,   emoji:"☕"},
  {id:452,nombre:"Empanada napolitana horneada",    marca:"Artesanal",    cat:"Comidas CL", porcion:145, cal:320, prot:13,  carbs:35,  grasas:14,  fibra:1, azucar:2, sodio:450,   emoji:"🥟"},
  {id:453,nombre:"Dobladita",                       marca:"Artesanal",    cat:"Panes",      porcion:70,  cal:210, prot:6,   carbs:36,  grasas:5,   fibra:1.5, azucar:2, sodio:380, emoji:"🥐"},
  {id:454,nombre:"Pan amasado",                     marca:"Artesanal",    cat:"Panes",      porcion:60,  cal:185, prot:5,   carbs:34,  grasas:4,   fibra:1, azucar:2, sodio:380,   emoji:"🍞"},
  {id:455,nombre:"Tortilla de rescoldo",            marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:240, prot:6,   carbs:42,  grasas:5.5, fibra:1.5, azucar:2, sodio:380, emoji:"🫓"},
  {id:456,nombre:"Pan de huevo",                    marca:"Artesanal",    cat:"Panes",      porcion:50,  cal:165, prot:4.5, carbs:28,  grasas:4,   fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},

  /* ── SNACKS CHILENOS ── */
  {id:460,nombre:"Chicharrón de cerdo",             marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:185, prot:12,  carbs:0,   grasas:15,  fibra:0, azucar:18, sodio:250,   emoji:"🥓"},
  {id:461,nombre:"Maní con cáscara tostado",        marca:"Genérico",     cat:"Snacks",     porcion:30,  cal:172, prot:7.5, carbs:5,   grasas:14,  fibra:2.5, azucar:18, sodio:250, emoji:"🥜"},
  {id:462,nombre:"Empolvados",                      marca:"Artesanal",    cat:"Snacks",     porcion:30,  cal:125, prot:1.5, carbs:18,  grasas:5.5, fibra:0.3, azucar:18, sodio:250, emoji:"🍪"},
  {id:463,nombre:"Galletas de vino",                marca:"Artesanal",    cat:"Snacks",     porcion:30,  cal:130, prot:2,   carbs:21,  grasas:4.5, fibra:0.5, azucar:18, sodio:250, emoji:"🍪"},
  {id:464,nombre:"Rosquillas",                      marca:"Artesanal",    cat:"Snacks",     porcion:40,  cal:175, prot:2.5, carbs:28,  grasas:6,   fibra:0.5, azucar:18, sodio:250, emoji:"🍩"},
  {id:465,nombre:"Queque de naranja (porción)",     marca:"Artesanal",    cat:"Snacks",     porcion:80,  cal:290, prot:4,   carbs:40,  grasas:13,  fibra:0.5, azucar:18, sodio:250, emoji:"🍰"},
  {id:466,nombre:"Tres leches (porción)",           marca:"Artesanal",    cat:"Snacks",     porcion:120, cal:380, prot:7,   carbs:48,  grasas:17,  fibra:0, azucar:18, sodio:250,   emoji:"🍰"},

  /* ── FRUTAS CHILENAS DE TEMPORADA ── */
  {id:470,nombre:"Nectarina",                       marca:"Natural",      cat:"Frutas",     porcion:130, cal:55,  prot:1.5, carbs:13,  grasas:0.3, fibra:2, azucar:10, sodio:2,   emoji:"🍑"},
  {id:471,nombre:"Tuna (higo chumbo)",              marca:"Natural",      cat:"Frutas",     porcion:80,  cal:50,  prot:0.7, carbs:13,  grasas:0.5, fibra:3.5, azucar:10, sodio:2, emoji:"🌵"},
  {id:472,nombre:"Papaya chilena",                  marca:"Natural",      cat:"Frutas",     porcion:150, cal:62,  prot:0.6, carbs:16,  grasas:0.1, fibra:1.5, azucar:10, sodio:2, emoji:"🍈"},
  {id:473,nombre:"Membrillo",                       marca:"Natural",      cat:"Frutas",     porcion:100, cal:57,  prot:0.4, carbs:15,  grasas:0.1, fibra:1.9, azucar:10, sodio:2, emoji:"🍋"},
  {id:474,nombre:"Damasco",                         marca:"Natural",      cat:"Frutas",     porcion:80,  cal:38,  prot:0.9, carbs:9,   grasas:0.1, fibra:1.5, azucar:10, sodio:2, emoji:"🍑"},
  {id:475,nombre:"Mora",                            marca:"Natural",      cat:"Frutas",     porcion:100, cal:43,  prot:1.4, carbs:10,  grasas:0.5, fibra:5, azucar:10, sodio:2,   emoji:"🫐"},

  /* ── SUPERMERCADO — MÁS MARCAS ── */
  {id:480,nombre:"Fideos Carozzi macarrón",         marca:"Carozzi",      cat:"Granos",     porcion:80,  cal:290, prot:10,  carbs:58,  grasas:1.5, fibra:2, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:481,nombre:"Salsa bolognesa Malloa",          marca:"Malloa",       cat:"Condimentos",porcion:125, cal:110, prot:6,   carbs:12,  grasas:4,   fibra:2, azucar:8, sodio:300,   emoji:"🫙"},
  {id:482,nombre:"Mermelada damasco Watts",         marca:"Watts",        cat:"Condimentos",porcion:20,  cal:46,  prot:0.1, carbs:11,  grasas:0,   fibra:0.3, azucar:8, sodio:300, emoji:"🍑"},
  {id:483,nombre:"Galletas Soda Carozzi",           marca:"Carozzi",      cat:"Snacks",     porcion:30,  cal:128, prot:2.5, carbs:21,  grasas:4,   fibra:0.5, azucar:18, sodio:250, emoji:"🍘"},
  {id:484,nombre:"Chocapic Nestlé",                 marca:"Nestlé",       cat:"Cereales",   porcion:30,  cal:118, prot:2.5, carbs:24,  grasas:1.5, fibra:1.5, azucar:12, sodio:200, emoji:"🥣"},
  {id:485,nombre:"Jugo en polvo Zuko",              marca:"Zuko",         cat:"Bebidas",    porcion:200, cal:80,  prot:0,   carbs:20,  grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🧃"},
  {id:486,nombre:"Néctar Watt's durazno",           marca:"Watt's",       cat:"Bebidas",    porcion:200, cal:90,  prot:0.3, carbs:22,  grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🧃"},
  {id:487,nombre:"Bebida Kem naranja lata",         marca:"CCU",          cat:"Bebidas",    porcion:350, cal:148, prot:0,   carbs:37,  grasas:0,   fibra:0, azucar:28, sodio:20,   emoji:"🥤"},
  {id:488,nombre:"Manjar La Lechera",               marca:"Nestlé",       cat:"Lácteos",    porcion:15,  cal:56,  prot:0.9, carbs:12,  grasas:0.6, fibra:0, azucar:4.5, sodio:10,   emoji:"🍯"},
  {id:489,nombre:"Crema pastelera Soprole",         marca:"Soprole",      cat:"Lácteos",    porcion:50,  cal:88,  prot:1.8, carbs:14,  grasas:3,   fibra:0, azucar:4.5, sodio:10,   emoji:"🫙"},
  {id:490,nombre:"Jamón planchado Ariztía",         marca:"Ariztía",      cat:"Cecinas",    porcion:25,  cal:42,  prot:7,   carbs:0.5, grasas:1.5, fibra:0, azucar:1, sodio:700,   emoji:"🥩"},
  {id:491,nombre:"Longaniza Montserrat",            marca:"Montserrat",   cat:"Cecinas",    porcion:50,  cal:155, prot:8,   carbs:1.5, grasas:13,  fibra:0, azucar:1, sodio:700,   emoji:"🌭"},
  {id:492,nombre:"Queso fresco Colun",              marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:70,  prot:5,   carbs:1,   grasas:5.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:493,nombre:"Crema de leche Colun",            marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:98,  prot:0.7, carbs:0.9, grasas:10,  fibra:0, azucar:4.5, sodio:10,   emoji:"🫙"},
  {id:494,nombre:"Yogurt de coco Soprole",          marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:155, prot:5,   carbs:18,  grasas:6.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🥣"},
  {id:495,nombre:"Cereal Lucky Charms",             marca:"General Mills",cat:"Cereales",   porcion:28,  cal:110, prot:2,   carbs:24,  grasas:1,   fibra:1.5, azucar:12, sodio:200, emoji:"🌈"},


  /* ── LÁCTEOS CHILENOS ── */
  {id:326,nombre:"Leche entera Colún",            marca:"Colún",        cat:"Lácteos",   porcion:200, cal:130, prot:6.4, carbs:9.6,  grasas:5.2, fibra:0,  azucar:9.6, sodio:90,  emoji:"🥛"},
  {id:327,nombre:"Leche semidescremada Colún",    marca:"Colún",        cat:"Lácteos",   porcion:200, cal:100, prot:6.4, carbs:9.6,  grasas:2.4, fibra:0,  azucar:9.6, sodio:90,  emoji:"🥛"},
  {id:328,nombre:"Leche descremada Colún",        marca:"Colún",        cat:"Lácteos",   porcion:200, cal:70,  prot:6.8, carbs:9.8,  grasas:0.2, fibra:0,  azucar:9.8, sodio:100, emoji:"🥛"},
  {id:329,nombre:"Leche entera Soprole",          marca:"Soprole",      cat:"Lácteos",   porcion:200, cal:130, prot:6.2, carbs:9.4,  grasas:5.4, fibra:0,  azucar:9.4, sodio:88,  emoji:"🥛"},
  {id:516,nombre:"Leche larga vida Lider",        marca:"Lider",        cat:"Lácteos",   porcion:200, cal:120, prot:6.0, carbs:9.2,  grasas:4.8, fibra:0,  azucar:9.2, sodio:85,  emoji:"🥛"},
  {id:517,nombre:"Yogurt natural Colún",          marca:"Colún",        cat:"Lácteos",   porcion:150, cal:90,  prot:5.5, carbs:9.0,  grasas:2.5, fibra:0,  azucar:9.0, sodio:70,  emoji:"🍶"},
  {id:518,nombre:"Yogurt frutado Soprole",        marca:"Soprole",      cat:"Lácteos",   porcion:150, cal:130, prot:4.5, carbs:22.0, grasas:2.5, fibra:0,  azucar:20, sodio:65,  emoji:"🍶"},
  {id:519,nombre:"Yogurt griego Nestlé",          marca:"Nestlé",       cat:"Lácteos",   porcion:150, cal:120, prot:8.0, carbs:10.0, grasas:4.0, fibra:0,  azucar:8.0, sodio:50,  emoji:"🍶"},
  {id:520,nombre:"Queso mantecoso Colún",         marca:"Colún",        cat:"Lácteos",   porcion:30,  cal:100, prot:6.0, carbs:0.5,  grasas:8.5, fibra:0,  azucar:0.5, sodio:200, emoji:"🧀"},
  {id:521,nombre:"Queso gauda Colún",             marca:"Colún",        cat:"Lácteos",   porcion:30,  cal:105, prot:7.0, carbs:0.5,  grasas:8.5, fibra:0,  azucar:0.5, sodio:210, emoji:"🧀"},
  {id:522,nombre:"Quesillo",                      marca:"Genérico",     cat:"Lácteos",   porcion:50,  cal:90,  prot:7.0, carbs:1.0,  grasas:6.0, fibra:0,  azucar:1.0, sodio:150, emoji:"🧀"},
  {id:523,nombre:"Queso crema Philadelphia",      marca:"Philadelphia", cat:"Lácteos",   porcion:30,  cal:90,  prot:2.0, carbs:1.5,  grasas:8.5, fibra:0,  azucar:1.5, sodio:130, emoji:"🧀"},
  {id:524,nombre:"Mantequilla Colún",             marca:"Colún",        cat:"Lácteos",   porcion:10,  cal:72,  prot:0.1, carbs:0.0,  grasas:8.0, fibra:0,  azucar:0,   sodio:60,  emoji:"🧈"},
  {id:339,nombre:"Crema de leche Soprole",        marca:"Soprole",      cat:"Lácteos",   porcion:50,  cal:170, prot:1.5, carbs:2.5,  grasas:17,  fibra:0,  azucar:2.5, sodio:40,  emoji:"🍦"},
  {id:525,nombre:"Leche condensada Nestlé",       marca:"Nestlé",       cat:"Lácteos",   porcion:40,  cal:130, prot:3.0, carbs:22.0, grasas:3.5, fibra:0,  azucar:22,  sodio:50,  emoji:"🥛"},

  /* ── PAN Y PANADERÍA CHILENA ── */
  {id:526,nombre:"Pan marraqueta",                marca:"Genérico",     cat:"Cereales",  porcion:80,  cal:220, prot:7.0, carbs:44.0, grasas:1.5, fibra:1.5,azucar:1.0, sodio:400, emoji:"🍞"},
  {id:527,nombre:"Pan hallulla",                  marca:"Genérico",     cat:"Cereales",  porcion:60,  cal:165, prot:5.0, carbs:33.0, grasas:1.5, fibra:1.0,azucar:1.0, sodio:320, emoji:"🍞"},
  {id:528,nombre:"Pan de molde Ideal",            marca:"Ideal",        cat:"Cereales",  porcion:30,  cal:78,  prot:2.8, carbs:14.5, grasas:1.0, fibra:0.8,azucar:1.5, sodio:140, emoji:"🍞"},
  {id:344,nombre:"Pan integral Ideal",            marca:"Ideal",        cat:"Cereales",  porcion:30,  cal:72,  prot:3.0, carbs:13.0, grasas:1.0, fibra:2.0,azucar:1.5, sodio:130, emoji:"🍞"},
  {id:529,nombre:"Pan de centeno",                marca:"Genérico",     cat:"Cereales",  porcion:30,  cal:65,  prot:2.5, carbs:12.0, grasas:0.5, fibra:3.0,azucar:0.5, sodio:120, emoji:"🍞"},
  {id:530,nombre:"Muffin inglés",                 marca:"Ideal",        cat:"Cereales",  porcion:57,  cal:135, prot:5.0, carbs:26.0, grasas:1.0, fibra:1.5,azucar:2.0, sodio:220, emoji:"🧁"},
  {id:531,nombre:"Coliza",                        marca:"Genérico",     cat:"Cereales",  porcion:60,  cal:160, prot:5.0, carbs:32.0, grasas:1.5, fibra:1.0,azucar:1.0, sodio:300, emoji:"🍞"},
  {id:532,nombre:"Tortilla de rescoldo",          marca:"Genérico",     cat:"Cereales",  porcion:60,  cal:180, prot:4.5, carbs:35.0, grasas:3.0, fibra:1.0,azucar:1.0, sodio:280, emoji:"🫓"},

  /* ── CECINAS Y EMBUTIDOS CHILENOS ── */
  {id:349,nombre:"Jamón de pierna Suprabesos",    marca:"Suprabesos",   cat:"Carnes",    porcion:50,  cal:65,  prot:11.0,carbs:1.0,  grasas:2.0, fibra:0,  azucar:0.5, sodio:550, emoji:"🥩"},
  {id:533,nombre:"Vienesa Suprabesos",            marca:"Suprabesos",   cat:"Carnes",    porcion:50,  cal:145, prot:6.5, carbs:2.0,  grasas:12.5,fibra:0,  azucar:0.5, sodio:480, emoji:"🌭"},
  {id:534,nombre:"Longaniza",                     marca:"Genérico",     cat:"Carnes",    porcion:80,  cal:250, prot:12.0,carbs:2.0,  grasas:22.0,fibra:0,  azucar:0.5, sodio:600, emoji:"🌭"},
  {id:535,nombre:"Chorizo",                       marca:"Genérico",     cat:"Carnes",    porcion:80,  cal:270, prot:13.0,carbs:1.5,  grasas:24.0,fibra:0,  azucar:0.5, sodio:650, emoji:"🌭"},
  {id:536,nombre:"Mortadela San Jorge",           marca:"San Jorge",    cat:"Carnes",    porcion:50,  cal:135, prot:7.0, carbs:2.5,  grasas:11.0,fibra:0,  azucar:1.0, sodio:500, emoji:"🥩"},
  {id:537,nombre:"Paté de hígado",                marca:"Genérico",     cat:"Carnes",    porcion:30,  cal:95,  prot:4.5, carbs:1.5,  grasas:8.0, fibra:0,  azucar:0.5, sodio:350, emoji:"🥫"},
  {id:538,nombre:"Tocino ahumado",                marca:"Genérico",     cat:"Carnes",    porcion:30,  cal:105, prot:7.0, carbs:0.5,  grasas:8.5, fibra:0,  azucar:0,   sodio:420, emoji:"🥓"},
  {id:539,nombre:"Prieta (morcilla)",             marca:"Genérico",     cat:"Carnes",    porcion:80,  cal:200, prot:10.0,carbs:5.0,  grasas:16.0,fibra:0,  azucar:1.0, sodio:550, emoji:"🥩"},

  /* ── COMIDA RÁPIDA CHILENA ── */
  {id:357,nombre:"Completo italiano",             marca:"Genérico",     cat:"Comida rápida",porcion:200,cal:480,prot:16.0,carbs:42.0,grasas:28.0,fibra:2.0,azucar:5.0, sodio:850, emoji:"🌭"},
  {id:358,nombre:"Completo dinámico",             marca:"Genérico",     cat:"Comida rápida",porcion:200,cal:450,prot:15.0,carbs:40.0,grasas:26.0,fibra:2.0,azucar:5.0, sodio:800, emoji:"🌭"},
  {id:359,nombre:"Churrasco italiano",            marca:"Genérico",     cat:"Comida rápida",porcion:250,cal:550,prot:28.0,carbs:38.0,grasas:32.0,fibra:2.0,azucar:4.0, sodio:900, emoji:"🥪"},
  {id:540,nombre:"Empanada de pino",              marca:"Genérico",     cat:"Comida rápida",porcion:130,cal:320,prot:15.0,carbs:30.0,grasas:15.0,fibra:1.5,azucar:2.0, sodio:450, emoji:"🥟"},
  {id:541,nombre:"Empanada de queso",             marca:"Genérico",     cat:"Comida rápida",porcion:120,cal:280,prot:10.0,carbs:30.0,grasas:13.0,fibra:1.0,azucar:1.5, sodio:380, emoji:"🥟"},
  {id:542,nombre:"Sopaipilla",                    marca:"Genérico",     cat:"Comida rápida",porcion:60, cal:175, prot:3.0, carbs:25.0, grasas:7.0, fibra:1.5,azucar:0.5, sodio:200, emoji:"🫓"},
  {id:543,nombre:"Sopaipilla pasada",             marca:"Genérico",     cat:"Comida rápida",porcion:100,cal:280, prot:3.5, carbs:52.0, grasas:7.0, fibra:1.5,azucar:25.0,sodio:220, emoji:"🫓"},
  {id:544,nombre:"Hamburguesa McDonald's Big Mac",marca:"McDonald's",   cat:"Comida rápida",porcion:200,cal:550,prot:25.0,carbs:44.0,grasas:30.0,fibra:3.0,azucar:9.0, sodio:1010,emoji:"🍔"},
  {id:545,nombre:"Papas fritas McDonald's",       marca:"McDonald's",   cat:"Comida rápida",porcion:117,cal:340,prot:4.0, carbs:44.0, grasas:16.0,fibra:4.0,azucar:0.5, sodio:400, emoji:"🍟"},
  {id:546,nombre:"Pizza Domino's Pepperoni",      marca:"Domino's",     cat:"Comida rápida",porcion:130,cal:330,prot:14.0,carbs:38.0,grasas:13.0,fibra:2.0,azucar:4.0, sodio:750, emoji:"🍕"},
  {id:367,nombre:"Cazuela de vacuno",             marca:"Genérico",     cat:"Platos chilenos",porcion:350,cal:280,prot:20.0,carbs:25.0,grasas:8.0, fibra:4.0,azucar:3.0, sodio:600, emoji:"🍲"},
  {id:368,nombre:"Pastel de choclo",              marca:"Genérico",     cat:"Platos chilenos",porcion:300,cal:350,prot:18.0,carbs:38.0,grasas:14.0,fibra:3.0,azucar:8.0, sodio:500, emoji:"🌽"},
  {id:369,nombre:"Charquicán",                    marca:"Genérico",     cat:"Platos chilenos",porcion:300,cal:320,prot:18.0,carbs:32.0,grasas:12.0,fibra:5.0,azucar:4.0, sodio:550, emoji:"🍲"},
  {id:547,nombre:"Porotos con riendas",           marca:"Genérico",     cat:"Platos chilenos",porcion:300,cal:380,prot:20.0,carbs:48.0,grasas:10.0,fibra:10.0,azucar:3.0,sodio:500, emoji:"🫘"},
  {id:548,nombre:"Lentejas guisadas",             marca:"Genérico",     cat:"Platos chilenos",porcion:250,cal:280,prot:16.0,carbs:38.0,grasas:6.0, fibra:9.0,azucar:3.0, sodio:450, emoji:"🫘"},
  {id:549,nombre:"Chupe de mariscos",             marca:"Genérico",     cat:"Platos chilenos",porcion:300,cal:320,prot:22.0,carbs:20.0,grasas:16.0,fibra:2.0,azucar:3.0, sodio:700, emoji:"🦐"},
  {id:550,nombre:"Curanto",                       marca:"Genérico",     cat:"Platos chilenos",porcion:400,cal:450,prot:35.0,carbs:30.0,grasas:18.0,fibra:4.0,azucar:3.0, sodio:800, emoji:"🦪"},

  /* ── BEBIDAS ── */
  {id:551,nombre:"Coca-Cola lata 350ml",          marca:"Coca-Cola",    cat:"Bebidas",   porcion:350, cal:140, prot:0,   carbs:39.0, grasas:0,   fibra:0,  azucar:39,  sodio:45,  emoji:"🥤"},
  {id:375,nombre:"Coca-Cola Zero 350ml",          marca:"Coca-Cola",    cat:"Bebidas",   porcion:350, cal:1,   prot:0,   carbs:0.5,  grasas:0,   fibra:0,  azucar:0,   sodio:50,  emoji:"🥤"},
  {id:376,nombre:"Pepsi lata 350ml",              marca:"Pepsi",        cat:"Bebidas",   porcion:350, cal:150, prot:0,   carbs:41.0, grasas:0,   fibra:0,  azucar:41,  sodio:40,  emoji:"🥤"},
  {id:377,nombre:"Sprite lata 350ml",             marca:"Sprite",       cat:"Bebidas",   porcion:350, cal:140, prot:0,   carbs:38.0, grasas:0,   fibra:0,  azucar:38,  sodio:65,  emoji:"🥤"},
  {id:378,nombre:"Agua Cachantun 500ml",          marca:"Cachantun",    cat:"Bebidas",   porcion:500, cal:0,   prot:0,   carbs:0,    grasas:0,   fibra:0,  azucar:0,   sodio:5,   emoji:"💧"},
  {id:379,nombre:"Agua Vital 500ml",              marca:"Vital",        cat:"Bebidas",   porcion:500, cal:0,   prot:0,   carbs:0,    grasas:0,   fibra:0,  azucar:0,   sodio:5,   emoji:"💧"},
  {id:552,nombre:"Jugo Watts naranja 200ml",      marca:"Watts",        cat:"Bebidas",   porcion:200, cal:90,  prot:0.5, carbs:22.0, grasas:0,   fibra:0.5,azucar:20,  sodio:10,  emoji:"🍊"},
  {id:553,nombre:"Néctar Andina durazno 200ml",   marca:"Andina",       cat:"Bebidas",   porcion:200, cal:95,  prot:0,   carbs:24.0, grasas:0,   fibra:0,  azucar:22,  sodio:15,  emoji:"🍑"},
  {id:554,nombre:"Red Bull 250ml",                marca:"Red Bull",     cat:"Bebidas",   porcion:250, cal:113, prot:1.0, carbs:28.0, grasas:0,   fibra:0,  azucar:27,  sodio:100, emoji:"🔴"},
  {id:555,nombre:"Monster Energy 355ml",          marca:"Monster",      cat:"Bebidas",   porcion:355, cal:160, prot:0,   carbs:40.0, grasas:0,   fibra:0,  azucar:38,  sodio:180, emoji:"🟢"},
  {id:556,nombre:"Té helado Fuze 400ml",          marca:"Fuze Tea",     cat:"Bebidas",   porcion:400, cal:80,  prot:0,   carbs:20.0, grasas:0,   fibra:0,  azucar:18,  sodio:30,  emoji:"🍵"},
  {id:557,nombre:"Clamato 355ml",                 marca:"Clamato",      cat:"Bebidas",   porcion:355, cal:110, prot:2.0, carbs:25.0, grasas:0,   fibra:0,  azucar:14,  sodio:950, emoji:"🥫"},

  /* ── SNACKS Y GALLETAS ── */
  {id:558,nombre:"Papas Lays clásicas",           marca:"Lays",         cat:"Snacks",    porcion:28,  cal:150, prot:2.0, carbs:16.0, grasas:9.0, fibra:1.0,azucar:0.5, sodio:170, emoji:"🥔"},
  {id:559,nombre:"Papas Pringles",                marca:"Pringles",     cat:"Snacks",    porcion:28,  cal:150, prot:1.5, carbs:16.0, grasas:9.0, fibra:0.5,azucar:0.5, sodio:180, emoji:"🥔"},
  {id:560,nombre:"Galletas Oreo",                 marca:"Oreo",         cat:"Snacks",    porcion:34,  cal:160, prot:1.5, carbs:25.0, grasas:7.0, fibra:1.0,azucar:14,  sodio:135, emoji:"🍪"},
  {id:561,nombre:"Galletas Tritón",               marca:"Costa",        cat:"Snacks",    porcion:36,  cal:170, prot:2.0, carbs:26.0, grasas:7.0, fibra:0.5,azucar:12,  sodio:110, emoji:"🍪"},
  {id:390,nombre:"Galletas Soda Costa",           marca:"Costa",        cat:"Snacks",    porcion:30,  cal:130, prot:2.5, carbs:22.0, grasas:4.0, fibra:0.5,azucar:2.0, sodio:200, emoji:"🍪"},
  {id:391,nombre:"Barrita Nutri Grain",           marca:"Kellogg's",    cat:"Snacks",    porcion:37,  cal:130, prot:2.0, carbs:27.0, grasas:2.5, fibra:1.5,azucar:13,  sodio:100, emoji:"🍫"},
  {id:392,nombre:"Chocolate Sublime",             marca:"Costa",        cat:"Snacks",    porcion:40,  cal:215, prot:3.5, carbs:24.0, grasas:12.0,fibra:1.0,azucar:21,  sodio:30,  emoji:"🍫"},
  {id:393,nombre:"Chocolate Beso de moza",        marca:"Costa",        cat:"Snacks",    porcion:40,  cal:195, prot:2.0, carbs:28.0, grasas:9.0, fibra:0.5,azucar:24,  sodio:35,  emoji:"🍫"},
  {id:394,nombre:"Mote con huesillo",             marca:"Genérico",     cat:"Snacks",    porcion:300, cal:250, prot:3.0, carbs:58.0, grasas:0.5, fibra:3.0,azucar:35,  sodio:20,  emoji:"🍑"},
  {id:395,nombre:"Maní tostado salado",           marca:"Genérico",     cat:"Snacks",    porcion:30,  cal:175, prot:7.0, carbs:5.0,  grasas:15.0,fibra:2.0,azucar:1.0, sodio:120, emoji:"🥜"},
  {id:396,nombre:"Nueces mix",                    marca:"Genérico",     cat:"Snacks",    porcion:30,  cal:185, prot:4.5, carbs:4.0,  grasas:18.0,fibra:2.0,azucar:1.0, sodio:2,   emoji:"🥜"},
  {id:397,nombre:"Churritos",                     marca:"Genérico",     cat:"Snacks",    porcion:28,  cal:130, prot:2.0, carbs:18.0, grasas:6.0, fibra:1.0,azucar:1.0, sodio:160, emoji:"🌽"},

  /* ── CEREALES Y DESAYUNO ── */
  {id:398,nombre:"Corn Flakes Kellogg's",         marca:"Kellogg's",    cat:"Cereales",  porcion:30,  cal:110, prot:2.5, carbs:25.0, grasas:0.5, fibra:1.0,azucar:2.5, sodio:200, emoji:"🥣"},
  {id:399,nombre:"Granola con miel",              marca:"Genérico",     cat:"Cereales",  porcion:45,  cal:200, prot:4.5, carbs:32.0, grasas:6.5, fibra:3.0,azucar:10,  sodio:50,  emoji:"🥣"},
  {id:562,nombre:"Avena 3 Ositos",                marca:"3 Ositos",     cat:"Cereales",  porcion:40,  cal:150, prot:5.0, carbs:27.0, grasas:2.5, fibra:4.0,azucar:0.5, sodio:5,   emoji:"🥣"},
  {id:563,nombre:"Muesli",                        marca:"Genérico",     cat:"Cereales",  porcion:45,  cal:175, prot:5.0, carbs:30.0, grasas:4.5, fibra:4.5,azucar:8.0, sodio:30,  emoji:"🥣"},
  {id:564,nombre:"Quaker instantáneo",            marca:"Quaker",       cat:"Cereales",  porcion:40,  cal:150, prot:5.0, carbs:27.0, grasas:3.0, fibra:3.5,azucar:1.0, sodio:10,  emoji:"🥣"},
  {id:565,nombre:"Special K Kellogg's",           marca:"Kellogg's",    cat:"Cereales",  porcion:31,  cal:115, prot:6.0, carbs:22.0, grasas:0.5, fibra:1.5,azucar:5.5, sodio:230, emoji:"🥣"},

  /* ── CONSERVAS Y ENLATADOS ── */
  {id:566,nombre:"Atún en agua Compass",          marca:"Compass",      cat:"Pescados",  porcion:85,  cal:100, prot:22.0,carbs:0,    grasas:1.0, fibra:0,  azucar:0,   sodio:320, emoji:"🐟"},
  {id:567,nombre:"Atún en aceite Compass",        marca:"Compass",      cat:"Pescados",  porcion:85,  cal:150, prot:22.0,carbs:0,    grasas:7.0, fibra:0,  azucar:0,   sodio:280, emoji:"🐟"},
  {id:568,nombre:"Sardinas en salsa de tomate",   marca:"Genérico",     cat:"Pescados",  porcion:90,  cal:150, prot:17.0,carbs:3.0,  grasas:8.0, fibra:0.5,azucar:2.0, sodio:450, emoji:"🐟"},
  {id:569,nombre:"Porotos negros en lata",        marca:"Genérico",     cat:"Legumbres", porcion:130, cal:110, prot:7.0, carbs:20.0, grasas:0.5, fibra:7.0,azucar:0.5, sodio:400, emoji:"🫘"},
  {id:570,nombre:"Garbanzos en lata",             marca:"Genérico",     cat:"Legumbres", porcion:130, cal:120, prot:7.0, carbs:20.0, grasas:2.0, fibra:6.0,azucar:1.0, sodio:350, emoji:"🫘"},
  {id:571,nombre:"Choclo en lata",                marca:"Genérico",     cat:"Verduras",  porcion:130, cal:90,  prot:3.0, carbs:19.0, grasas:1.0, fibra:2.5,azucar:5.0, sodio:250, emoji:"🌽"},
  {id:572,nombre:"Tomate en cubos San Remo",      marca:"San Remo",     cat:"Verduras",  porcion:130, cal:30,  prot:1.5, carbs:6.0,  grasas:0.5, fibra:2.0,azucar:4.0, sodio:180, emoji:"🍅"},

  /* ── SALSAS Y CONDIMENTOS ── */
  {id:573,nombre:"Mayonesa Hellmann's",           marca:"Hellmann's",   cat:"Salsas",    porcion:15,  cal:100, prot:0.2, carbs:0.5,  grasas:11.0,fibra:0,  azucar:0.5, sodio:80,  emoji:"🫙"},
  {id:574,nombre:"Mayonesa Light Hellmann's",     marca:"Hellmann's",   cat:"Salsas",    porcion:15,  cal:50,  prot:0.2, carbs:2.0,  grasas:4.5, fibra:0,  azucar:1.5, sodio:90,  emoji:"🫙"},
  {id:575,nombre:"Ketchup Heinz",                 marca:"Heinz",        cat:"Salsas",    porcion:17,  cal:20,  prot:0.5, carbs:5.0,  grasas:0,   fibra:0.5,azucar:4.0, sodio:190, emoji:"🍅"},
  {id:576,nombre:"Mostaza americana",             marca:"Genérico",     cat:"Salsas",    porcion:10,  cal:10,  prot:0.5, carbs:1.0,  grasas:0.5, fibra:0.5,azucar:0.5, sodio:120, emoji:"🟡"},
  {id:577,nombre:"Salsa de soja Kikkoman",        marca:"Kikkoman",     cat:"Salsas",    porcion:15,  cal:10,  prot:1.5, carbs:1.0,  grasas:0,   fibra:0,  azucar:0.5, sodio:920, emoji:"🫙"},
  {id:578,nombre:"Aceite de oliva",               marca:"Genérico",     cat:"Salsas",    porcion:10,  cal:90,  prot:0,   carbs:0,    grasas:10.0,fibra:0,  azucar:0,   sodio:0,   emoji:"🫙", precio:3490, pesoCompra:500},
  {id:579,nombre:"Aceite vegetal",                marca:"Genérico",     cat:"Salsas",    porcion:10,  cal:90,  prot:0,   carbs:0,    grasas:10.0,fibra:0,  azucar:0,   sodio:0,   emoji:"🫙", precio:1990, pesoCompra:1000},
  {id:580,nombre:"Mermelada frutilla Watts",      marca:"Watts",        cat:"Salsas",    porcion:20,  cal:50,  prot:0.2, carbs:13.0, grasas:0,   fibra:0.5,azucar:12,  sodio:5,   emoji:"🍓"},
  {id:581,nombre:"Manjar",                        marca:"Genérico",     cat:"Salsas",    porcion:20,  cal:65,  prot:1.5, carbs:13.0, grasas:1.0, fibra:0,  azucar:13,  sodio:35,  emoji:"🍯"},

  /* ── PASTAS Y ARROZ ── */
  {id:582,nombre:"Fideos spaghetti Carozzi",      marca:"Carozzi",      cat:"Cereales",  porcion:85,  cal:300, prot:11.0,carbs:61.0, grasas:1.5, fibra:2.5,azucar:2.0, sodio:5,   emoji:"🍝"},
  {id:421,nombre:"Fideos pluma Carozzi",          marca:"Carozzi",      cat:"Cereales",  porcion:85,  cal:300, prot:11.0,carbs:61.0, grasas:1.5, fibra:2.5,azucar:2.0, sodio:5,   emoji:"🍝"},
  {id:422,nombre:"Arroz grado 1 Tucapel",         marca:"Tucapel",      cat:"Cereales",  porcion:50,  cal:175, prot:3.5, carbs:39.0, grasas:0.5, fibra:0.5,azucar:0,   sodio:2,   emoji:"🍚", precio:1290, pesoCompra:1000},
  {id:423,nombre:"Arroz integral Tucapel",        marca:"Tucapel",      cat:"Cereales",  porcion:50,  cal:170, prot:4.0, carbs:36.0, grasas:1.0, fibra:2.5,azucar:0,   sodio:2,   emoji:"🍚"},
  {id:424,nombre:"Quinoa",                        marca:"Genérico",     cat:"Cereales",  porcion:45,  cal:165, prot:6.0, carbs:30.0, grasas:2.5, fibra:3.0,azucar:0.5, sodio:5,   emoji:"🌾"},
  {id:425,nombre:"Cuscús",                        marca:"Genérico",     cat:"Cereales",  porcion:45,  cal:160, prot:5.5, carbs:33.0, grasas:0.5, fibra:2.5,azucar:0.5, sodio:5,   emoji:"🌾"},

  /* ── HELADOS Y POSTRES ── */
  {id:426,nombre:"Helado Panda palito",           marca:"Panda",        cat:"Postres",   porcion:73,  cal:180, prot:2.5, carbs:22.0, grasas:9.0, fibra:0,  azucar:18,  sodio:50,  emoji:"🍦"},
  {id:427,nombre:"Helado Savory vainilla",        marca:"Savory",       cat:"Postres",   porcion:100, cal:220, prot:3.5, carbs:26.0, grasas:11.0,fibra:0,  azucar:22,  sodio:70,  emoji:"🍦"},
  {id:428,nombre:"Kuchen de frambuesa",           marca:"Genérico",     cat:"Postres",   porcion:100, cal:280, prot:4.0, carbs:38.0, grasas:13.0,fibra:1.5,azucar:22,  sodio:120, emoji:"🍰"},
  {id:429,nombre:"Milhojas",                      marca:"Genérico",     cat:"Postres",   porcion:100, cal:350, prot:4.5, carbs:42.0, grasas:18.0,fibra:0.5,azucar:28,  sodio:150, emoji:"🍰"},
  {id:583,nombre:"Leche nevada",                  marca:"Genérico",     cat:"Postres",   porcion:150, cal:220, prot:5.0, carbs:38.0, grasas:6.0, fibra:0,  azucar:35,  sodio:80,  emoji:"🍮"},
  {id:584,nombre:"Alfajor",                       marca:"Genérico",     cat:"Postres",   porcion:50,  cal:190, prot:2.5, carbs:28.0, grasas:8.0, fibra:0.5,azucar:18,  sodio:80,  emoji:"🍪"},

  /* ── FRUTAS CHILENAS ── */
  {id:585,nombre:"Chirimoya",                     marca:"Genérico",     cat:"Frutas",    porcion:150, cal:120, prot:2.5, carbs:28.0, grasas:1.0, fibra:5.0,azucar:22,  sodio:5,   emoji:"🍈"},
  {id:586,nombre:"Lúcuma",                        marca:"Genérico",     cat:"Frutas",    porcion:100, cal:99,  prot:1.5, carbs:23.0, grasas:0.5, fibra:3.5,azucar:12,  sodio:5,   emoji:"🟡"},
  {id:587,nombre:"Frambuesa",                     marca:"Genérico",     cat:"Frutas",    porcion:100, cal:52,  prot:1.2, carbs:12.0, grasas:0.7, fibra:6.5,azucar:4.5, sodio:1,   emoji:"🫐"},
  {id:588,nombre:"Murta",                         marca:"Genérico",     cat:"Frutas",    porcion:100, cal:45,  prot:0.8, carbs:10.5, grasas:0.5, fibra:4.0,azucar:7.0, sodio:2,   emoji:"🫐"},
  {id:589,nombre:"Uva chilena",                   marca:"Genérico",     cat:"Frutas",    porcion:100, cal:69,  prot:0.7, carbs:18.0, grasas:0.2, fibra:0.9,azucar:16,  sodio:2,   emoji:"🍇"},
  {id:590,nombre:"Tuna (higo chumbo)",            marca:"Genérico",     cat:"Frutas",    porcion:100, cal:41,  prot:0.7, carbs:9.5,  grasas:0.5, fibra:3.6,azucar:6.0, sodio:5,   emoji:"🌵"},

  /* ── VERDURAS CHILENAS ── */
  {id:591,nombre:"Poroto verde",                  marca:"Genérico",     cat:"Verduras",  porcion:100, cal:31,  prot:1.8, carbs:7.0,  grasas:0.1, fibra:2.7,azucar:3.3, sodio:6,   emoji:"🫘"},
  {id:592,nombre:"Choclo desgranado",             marca:"Genérico",     cat:"Verduras",  porcion:100, cal:86,  prot:3.3, carbs:19.0, grasas:1.4, fibra:2.7,azucar:3.2, sodio:15,  emoji:"🌽"},
  {id:593,nombre:"Zapallo camote",                marca:"Genérico",     cat:"Verduras",  porcion:100, cal:26,  prot:1.0, carbs:5.5,  grasas:0.1, fibra:0.5,azucar:2.8, sodio:1,   emoji:"🎃"},
  {id:594,nombre:"Acelga",                        marca:"Genérico",     cat:"Verduras",  porcion:100, cal:20,  prot:1.8, carbs:3.7,  grasas:0.2, fibra:1.6,azucar:1.1, sodio:213, emoji:"🥬"},
  {id:595,nombre:"Betarraga",                     marca:"Genérico",     cat:"Verduras",  porcion:100, cal:43,  prot:1.6, carbs:10.0, grasas:0.2, fibra:2.8,azucar:7.0, sodio:78,  emoji:"🟣"},
  {id:596,nombre:"Repollo",                       marca:"Genérico",     cat:"Verduras",  porcion:100, cal:25,  prot:1.3, carbs:6.0,  grasas:0.1, fibra:2.5,azucar:3.2, sodio:18,  emoji:"🥬"},
  {id:597,nombre:"Coliflor",                      marca:"Genérico",     cat:"Verduras",  porcion:100, cal:25,  prot:2.0, carbs:5.0,  grasas:0.3, fibra:2.0,azucar:1.9, sodio:30,  emoji:"🥦"},
  {id:598,nombre:"Pimentón rojo",                 marca:"Genérico",     cat:"Verduras",  porcion:100, cal:31,  prot:1.0, carbs:6.0,  grasas:0.3, fibra:2.1,azucar:4.2, sodio:4,   emoji:"🫑"},
  {id:446,nombre:"Alcachofa",                     marca:"Genérico",     cat:"Verduras",  porcion:120, cal:48,  prot:3.3, carbs:11.0, grasas:0.2, fibra:5.4,azucar:1.0, sodio:94,  emoji:"🌿"},

  /* ── CARNES CHILENAS ── */
  {id:447,nombre:"Cazuela de pollo",              marca:"Genérico",     cat:"Carnes",    porcion:350, cal:260, prot:22.0,carbs:22.0, grasas:8.0, fibra:3.0,azucar:3.0, sodio:550, emoji:"🍗"},
  {id:448,nombre:"Pollo asado al horno",          marca:"Genérico",     cat:"Carnes",    porcion:150, cal:280, prot:28.0,carbs:0,    grasas:18.0,fibra:0,  azucar:0,   sodio:380, emoji:"🍗"},
  {id:449,nombre:"Lomo de cerdo",                 marca:"Genérico",     cat:"Carnes",    porcion:100, cal:190, prot:22.0,carbs:0,    grasas:11.0,fibra:0,  azucar:0,   sodio:60,  emoji:"🥩"},
  {id:599,nombre:"Plateada vacuno",               marca:"Genérico",     cat:"Carnes",    porcion:100, cal:230, prot:20.0,carbs:0,    grasas:16.0,fibra:0,  azucar:0,   sodio:70,  emoji:"🥩"},
  {id:600,nombre:"Asado de tira",                 marca:"Genérico",     cat:"Carnes",    porcion:100, cal:250, prot:19.0,carbs:0,    grasas:19.0,fibra:0,  azucar:0,   sodio:65,  emoji:"🥩"},
  {id:601,nombre:"Entrañas",                      marca:"Genérico",     cat:"Carnes",    porcion:100, cal:215, prot:22.0,carbs:0,    grasas:14.0,fibra:0,  azucar:0,   sodio:70,  emoji:"🥩"},

  /* ── PESCADOS Y MARISCOS ── */
  {id:602,nombre:"Reineta",                       marca:"Genérico",     cat:"Pescados",  porcion:150, cal:180, prot:25.0,carbs:0,    grasas:9.0, fibra:0,  azucar:0,   sodio:80,  emoji:"🐟"},
  {id:603,nombre:"Congrio",                       marca:"Genérico",     cat:"Pescados",  porcion:150, cal:160, prot:26.0,carbs:0,    grasas:6.0, fibra:0,  azucar:0,   sodio:75,  emoji:"🐟"},
  {id:604,nombre:"Corvina",                       marca:"Genérico",     cat:"Pescados",  porcion:150, cal:155, prot:27.0,carbs:0,    grasas:5.0, fibra:0,  azucar:0,   sodio:80,  emoji:"🐟"},
  {id:605,nombre:"Machas",                        marca:"Genérico",     cat:"Pescados",  porcion:100, cal:65,  prot:12.0,carbs:3.0,  grasas:1.0, fibra:0,  azucar:0,   sodio:250, emoji:"🦪"},
  {id:457,nombre:"Cholgas",                       marca:"Genérico",     cat:"Pescados",  porcion:100, cal:70,  prot:12.0,carbs:3.5,  grasas:1.5, fibra:0,  azucar:0,   sodio:280, emoji:"🦪"},
  {id:458,nombre:"Centolla",                      marca:"Genérico",     cat:"Pescados",  porcion:100, cal:90,  prot:18.0,carbs:0,    grasas:1.5, fibra:0,  azucar:0,   sodio:300, emoji:"🦀"},
  {id:459,nombre:"Jaiba",                         marca:"Genérico",     cat:"Pescados",  porcion:100, cal:82,  prot:17.0,carbs:0,    grasas:1.0, fibra:0,  azucar:0,   sodio:280, emoji:"🦀"},

  /* ── SUPERMERCADO MARCAS CHILENAS ── */
  {id:606,nombre:"Salsa de tomate Malloa",        marca:"Malloa",       cat:"Salsas",    porcion:130, cal:70,  prot:2.5, carbs:14.0, grasas:1.0, fibra:2.0,azucar:10,  sodio:350, emoji:"🍅"},
  {id:607,nombre:"Duraznos en almíbar Malloa",    marca:"Malloa",       cat:"Frutas",    porcion:130, cal:95,  prot:0.8, carbs:24.0, grasas:0.1, fibra:1.0,azucar:22,  sodio:10,  emoji:"🍑"},
  {id:608,nombre:"Espárragos en lata Malloa",     marca:"Malloa",       cat:"Verduras",  porcion:130, cal:30,  prot:3.0, carbs:4.5,  grasas:0.3, fibra:2.5,azucar:2.0, sodio:400, emoji:"🌿"},
  {id:609,nombre:"Leche en polvo Nido",           marca:"Nestlé",       cat:"Lácteos",   porcion:25,  cal:120, prot:5.5, carbs:12.0, grasas:6.0, fibra:0,  azucar:12,  sodio:90,  emoji:"🥛"},
  {id:610,nombre:"Té Supremo bolsita",            marca:"Supremo",      cat:"Bebidas",   porcion:200, cal:2,   prot:0,   carbs:0.5,  grasas:0,   fibra:0,  azucar:0,   sodio:5,   emoji:"🍵"},
  {id:611,nombre:"Café instantáneo Nescafé",      marca:"Nescafé",      cat:"Bebidas",   porcion:200, cal:5,   prot:0.3, carbs:0.8,  grasas:0,   fibra:0,  azucar:0,   sodio:5,   emoji:"☕"},
  {id:612,nombre:"Néctar Kapo",                   marca:"Kapo",         cat:"Bebidas",   porcion:200, cal:80,  prot:0,   carbs:20.0, grasas:0,   fibra:0,  azucar:19,  sodio:10,  emoji:"🥤"},
  {id:467,nombre:"Bebida Bilz",                   marca:"Bilz",         cat:"Bebidas",   porcion:350, cal:145, prot:0,   carbs:38.0, grasas:0,   fibra:0,  azucar:38,  sodio:45,  emoji:"🥤"},
  {id:468,nombre:"Bebida Pap",                    marca:"Pap",          cat:"Bebidas",   porcion:350, cal:140, prot:0,   carbs:36.0, grasas:0,   fibra:0,  azucar:36,  sodio:40,  emoji:"🥤"},
  {id:469,nombre:"Yogurt Chico Colún",            marca:"Colún",        cat:"Lácteos",   porcion:100, cal:80,  prot:3.5, carbs:12.0, grasas:2.0, fibra:0,  azucar:11,  sodio:50,  emoji:"🍶"},
  {id:613,nombre:"Galletas Animalitos",           marca:"Costa",        cat:"Snacks",    porcion:30,  cal:130, prot:2.0, carbs:22.0, grasas:4.0, fibra:0.5,azucar:8.0, sodio:90,  emoji:"🍪"},
  {id:614,nombre:"Galletas Amor",                 marca:"Costa",        cat:"Snacks",    porcion:30,  cal:125, prot:2.5, carbs:20.0, grasas:4.5, fibra:0.5,azucar:7.0, sodio:85,  emoji:"🍪"},
  {id:615,nombre:"Pan de pascua",                 marca:"Genérico",     cat:"Postres",   porcion:80,  cal:280, prot:5.0, carbs:44.0, grasas:10.0,fibra:2.0,azucar:28,  sodio:150, emoji:"🎄"},
  {id:616,nombre:"Humitas",                       marca:"Genérico",     cat:"Platos chilenos",porcion:200,cal:220,prot:5.0,carbs:40.0,grasas:5.0, fibra:3.0,azucar:2.0, sodio:300, emoji:"🌽"},
  {id:617,nombre:"Pebre",                         marca:"Genérico",     cat:"Salsas",    porcion:50,  cal:20,  prot:0.8, carbs:4.0,  grasas:0.3, fibra:1.0,azucar:2.0, sodio:150, emoji:"🌶️"},
  {id:618,nombre:"Chancho en piedra",             marca:"Genérico",     cat:"Salsas",    porcion:50,  cal:35,  prot:1.0, carbs:7.0,  grasas:0.5, fibra:1.5,azucar:4.0, sodio:200, emoji:"🍅"},

  /* ── SUPLEMENTOS ── */
  {id:320,nombre:"Whey protein Gold Standard",    marca:"ON",           cat:"Suplementos",porcion:31,  cal:120, prot:24,  carbs:3,   grasas:2,   fibra:0, azucar:3, sodio:100,   emoji:"💪"},
  {id:321,nombre:"Proteína vegana (guisante)",    marca:"Genérico",     cat:"Suplementos",porcion:30,  cal:110, prot:20,  carbs:5,   grasas:2.5, fibra:1, azucar:3, sodio:100,   emoji:"🌱"},
  {id:322,nombre:"Barra proteica Quest",          marca:"Quest",        cat:"Suplementos",porcion:60,  cal:190, prot:21,  carbs:22,  grasas:8,   fibra:14, azucar:3, sodio:100,  emoji:"🍫"},
  {id:323,nombre:"Creatina monohidratada",        marca:"Genérico",     cat:"Suplementos",porcion:5,   cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"⚗️"},
  {id:324,nombre:"BCAA polvo",                    marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:8,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"💊"},
  {id:325,nombre:"Colágeno hidrolizado",          marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:9,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"✨"},
  /* ── PRODUCTOS FALTANTES CLAVE ── */
  {id:496, nombre:"Salmón fresco",              marca:"Natural",     cat:"Pescados",   porcion:150, cal:311, prot:31,  carbs:0,   grasas:19,  fibra:0,   azucar:0,  sodio:75,  emoji:"🐟"},
  {id:497, nombre:"Palta / Aguacate",           marca:"Natural",     cat:"Frutas",     porcion:100, cal:160, prot:2,   carbs:9,   grasas:15,  fibra:6.7, azucar:0.7,sodio:7,   emoji:"🥑"},
  {id:498, nombre:"Quínoa cocida",              marca:"Natural",     cat:"Granos",     porcion:185, cal:222, prot:8,   carbs:39,  grasas:3.5, fibra:5,   azucar:1.6,sodio:13,  emoji:"🌾"},
  {id:499, nombre:"Leche de avena",             marca:"Genérico",    cat:"Bebidas",    porcion:250, cal:130, prot:3,   carbs:23,  grasas:3,   fibra:1.5, azucar:10, sodio:100, emoji:"🥛"},
  {id:500, nombre:"Leche de almendras sin azúcar", marca:"Genérico", cat:"Bebidas",    porcion:250, cal:40,  prot:1.5, carbs:3,   grasas:3,   fibra:0.5, azucar:0,  sodio:150, emoji:"🥛"},
  {id:501, nombre:"Tofu firme",                 marca:"Genérico",    cat:"Legumbres",  porcion:100, cal:76,  prot:8,   carbs:2,   grasas:4.5, fibra:0.3, azucar:0.5,sodio:7,   emoji:"🫘"},
  {id:502, nombre:"Hummus",                     marca:"Genérico",    cat:"Legumbres",  porcion:30,  cal:66,  prot:2,   carbs:6,   grasas:4,   fibra:2,   azucar:0.5,sodio:78,  emoji:"🫘"},
  {id:503, nombre:"Proteína whey vainilla",     marca:"Genérico",    cat:"Suplementos",porcion:30,  cal:120, prot:24,  carbs:4,   grasas:2,   fibra:0,   azucar:3,  sodio:130, emoji:"🥤"},
  {id:504, nombre:"Proteína whey chocolate",    marca:"Genérico",    cat:"Suplementos",porcion:30,  cal:122, prot:24,  carbs:5,   grasas:2,   fibra:0,   azucar:4,  sodio:130, emoji:"🥤"},
  {id:505,nombre:"Reineta al horno",            marca:"Natural",     cat:"Pescados",   porcion:150, cal:180, prot:25,  carbs:0,   grasas:8,   fibra:0,   azucar:0,  sodio:90,  emoji:"🐟"},
  {id:506,nombre:"Congrio colorado",            marca:"Natural",     cat:"Pescados",   porcion:150, cal:195, prot:28,  carbs:0,   grasas:9,   fibra:0,   azucar:0,  sodio:85,  emoji:"🐟"},
  {id:507,nombre:"Plateada de vacuno",          marca:"Natural",     cat:"Carnes",     porcion:150, cal:320, prot:25,  carbs:0,   grasas:24,  fibra:0,   azucar:0,  sodio:65,  emoji:"🥩"},
  {id:508,nombre:"Osobuco de vacuno",           marca:"Natural",     cat:"Carnes",     porcion:200, cal:280, prot:30,  carbs:0,   grasas:17,  fibra:0,   azucar:0,  sodio:70,  emoji:"🥩"},
  {id:509,nombre:"Chuleta de cerdo",            marca:"Natural",     cat:"Carnes",     porcion:120, cal:195, prot:26,  carbs:0,   grasas:10,  fibra:0,   azucar:0,  sodio:60,  emoji:"🥩"},
  {id:510,nombre:"Atún al natural lata",        marca:"Genérico",    cat:"Pescados",   porcion:85,  cal:100, prot:22,  carbs:0,   grasas:1,   fibra:0,   azucar:0,  sodio:310, emoji:"🐟"},
  {id:511,nombre:"Edamame cocido",              marca:"Natural",     cat:"Legumbres",  porcion:100, cal:121, prot:11,  carbs:10,  grasas:5,   fibra:5,   azucar:2,  sodio:6,   emoji:"🫘"},
  {id:512,nombre:"Granola sin azúcar",          marca:"Genérico",    cat:"Cereales",   porcion:45,  cal:180, prot:5,   carbs:25,  grasas:7,   fibra:4,   azucar:2,  sodio:15,  emoji:"🌾"},
  {id:513,nombre:"Arroz integral cocido",       marca:"Genérico",    cat:"Granos",     porcion:200, cal:216, prot:5,   carbs:45,  grasas:1.8, fibra:3.5, azucar:0,  sodio:10,  emoji:"🍚"},
  {id:514,nombre:"Batata / Camote cocido",      marca:"Natural",     cat:"Verduras",   porcion:130, cal:112, prot:2,   carbs:26,  grasas:0.1, fibra:3.8, azucar:5.4,sodio:72,  emoji:"🍠"},
  {id:515,nombre:"Kéfir natural",               marca:"Genérico",    cat:"Lácteos",    porcion:250, cal:150, prot:10,  carbs:12,  grasas:5,   fibra:0,   azucar:8,  sodio:90,  emoji:"🥛"},
];

/* ── Saneamiento nutricional ──
   Corrige invariantes físicamente imposibles en los datos de la base
   (p.ej. azúcar > carbohidratos, o fibra > carbohidratos), que aparecían
   en algunos productos por valores placeholder. Se aplica una sola vez al
   cargar la app, así toda la app (búsqueda, totales, tips, sellos) usa
   datos coherentes sin tener que editar cada producto a mano. */
const sanitizeFoodData = (f) => {
  const carbs = typeof f.carbs === 'number' ? Math.max(0, f.carbs) : f.carbs;
  let azucar = f.azucar, fibra = f.fibra;
  if(typeof azucar === 'number'){
    azucar = Math.max(0, azucar);
    if(typeof carbs === 'number') azucar = Math.min(azucar, carbs); // azúcar ≤ carbohidratos
  }
  if(typeof fibra === 'number'){
    fibra = Math.max(0, fibra);
    if(typeof carbs === 'number') fibra = Math.min(fibra, carbs);   // fibra ≤ carbohidratos
  }
  return {...f, carbs, azucar, fibra};
};
const DB = DB_RAW.map(sanitizeFoodData);


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
  {id:'volleyball',nombre:'Vóleibol',       emoji:'🏐', met:6.0,  cat:'Deportes'},
  {id:'rugby',    nombre:'Rugby',           emoji:'🏉', met:8.3,  cat:'Deportes'},
  {id:'surf',     nombre:'Surf',            emoji:'🏄', met:6.0,  cat:'Deportes'},
  {id:'kayak',    nombre:'Kayak',           emoji:'🛶', met:5.0,  cat:'Deportes'},
  {id:'ski',      nombre:'Esquí',           emoji:'⛷️', met:7.0,  cat:'Deportes'},
  {id:'skate',    nombre:'Skate',           emoji:'🛹', met:5.0,  cat:'Deportes'},
  {id:'golf',     nombre:'Golf',            emoji:'⛳', met:4.3,  cat:'Deportes'},
  {id:'martial',  nombre:'Artes marciales', emoji:'🥋', met:10.0, cat:'Deportes'},
  {id:'spinning', nombre:'Spinning',        emoji:'🚴', met:8.5,  cat:'Cardio'},
  {id:'rowing',   nombre:'Remo',            emoji:'🚣', met:7.0,  cat:'Cardio'},
  {id:'zumba',    nombre:'Zumba',           emoji:'💃', met:6.5,  cat:'Cardio'},
  {id:'aerobic',  nombre:'Aeróbicos',       emoji:'🤸', met:6.0,  cat:'Cardio'},
  {id:'treadmill',nombre:'Cinta correr',    emoji:'🏃', met:9.0,  cat:'Cardio'},
  {id:'trx',      nombre:'TRX',             emoji:'🔗', met:6.0,  cat:'Fuerza'},
  {id:'functional',nombre:'Funcional',      emoji:'💪', met:7.0,  cat:'Fuerza'},
  {id:'powerlifting',nombre:'Powerlifting', emoji:'🏋️', met:6.0,  cat:'Fuerza'},
  {id:'combat',   nombre:'Kickboxing',      emoji:'🥊', met:10.0, cat:'Fuerza'},
  {id:'taichi',   nombre:'Tai Chi',         emoji:'🧘', met:3.0,  cat:'Flexib.'},
  {id:'aqua',     nombre:'Aquaeróbicos',    emoji:'🏊', met:5.5,  cat:'Cardio'},
  {id:'cleaning', nombre:'Limpiar casa',    emoji:'🧹', met:3.5,  cat:'Cotidiano'},
  {id:'gardening',nombre:'Jardinería',      emoji:'🌱', met:4.0,  cat:'Cotidiano'},
  {id:'shopping', nombre:'Hacer compras',   emoji:'🛒', met:2.5,  cat:'Cotidiano'},
  {id:'cooking',  nombre:'Cocinar',         emoji:'👨‍🍳',met:2.5,  cat:'Cotidiano'},
];


/* ═══════════════════════════════════════════════════════
   TIPS NUTRICIONALES
═══════════════════════════════════════════════════════ */
const getTips = (tot, metas, obj, agua, pct, exercises, streak, waterGoal=8) => {
  const tips = [];
  const protPct  = metas.prot  > 0 ? tot.prot  / metas.prot  : 0;
  const azPct    = (tot.azucar||0) / 25; // OMS: máx 25g/día
  const hr       = new Date().getHours();
  if(pct === 0 && hr >= 9)
    tips.push({icon:'🌅', text:'¡Empieza registrando tu desayuno!', color:'#FF9500'});
  if(pct > 0 && pct < 0.4 && hr >= 14)
    tips.push({icon:'⚡', text:'Llevas pocas calorías. Recuerda comer bien para tener energía.', color:'#FF9500'});
  if(pct > 1.15)
    tips.push({icon:'⚠️', text:'Superaste tu meta calórica. Termina el día con algo liviano.', color:'#FF3B30'});
  if(pct >= 0.9 && pct <= 1.05)
    tips.push({icon:'🎯', text:'¡Perfecto! Estás justo en tu meta calórica hoy.', color:'#34C759'});
  if(protPct < 0.5 && pct > 0.3)
    tips.push({icon:'🥩', text:`Solo ${Math.round(tot.prot)}g de proteína. Agrega pollo, huevos o atún.`, color:'#FF3B30'});
  if(azPct > 1)
    tips.push({icon:'🍬', text:`Llevas ${Math.round(tot.azucar||0)}g de azúcar, más del límite OMS de 25g/día.`, color:'#FF3B30'});
  if(azPct > 0.8 && azPct <= 1)
    tips.push({icon:'🍬', text:`Cerca del límite de azúcar (${Math.round(tot.azucar||0)}/25g). Cuidado con bebidas y snacks.`, color:'#FF9500'});
  if(agua < 4 && hr >= 15)
    tips.push({icon:'💧', text:`Solo ${agua} de ${waterGoal} vasos de agua. Tomar más mejora el metabolismo.`, color:'#D42020'});
  if(agua >= 8)
    tips.push({icon:'💧', text:'¡Hidratación perfecta! Tu cuerpo te lo agradece.', color:'#D42020'});
  if(exercises.length > 0)
    tips.push({icon:'🔥', text:`Quemaste ${exercises.reduce((s,e)=>s+e.burn,0)} kcal con ejercicio. ¡Sigue así!`, color:'#FF9500'});
  if(streak.days >= 7)
    tips.push({icon:'🏆', text:`¡${streak.days} días seguidos! Eres constante, eso es lo más importante.`, color:'#FFD60A'});
  if(tot.fibra < 10 && pct > 0.5)
    tips.push({icon:'🥦', text:'Poca fibra hoy. Agrega verduras o legumbres para mejorar la digestión.', color:'#34C759'});
  return tips.slice(0, 3);
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
/* ──────────────────────────────────────────────
   SINÓNIMOS CHILENOS — búsqueda inteligente
   Permite encontrar "palta" buscando "aguacate"
   y viceversa, más otros coloquialismos locales.
────────────────────────────────────────────── */
const SINONIMOS_CL = {
  palta:       ['aguacate'],
  aguacate:    ['palta'],
  betarraga:   ['remolacha','betabel'],
  remolacha:   ['betarraga','betabel'],
  choclo:      ['maíz','maiz','elote'],
  maíz:        ['choclo','elote'],
  maiz:        ['choclo','elote'],
  porotos:     ['frijoles','frijol','habichuelas'],
  frijoles:    ['porotos','poroto'],
  poroto:      ['frijol','porotos'],
  arvejas:     ['guisantes','chícharos'],
  guisantes:   ['arvejas','chícharos'],
  zapallo:     ['calabaza','auyama'],
  calabaza:    ['zapallo','auyama'],
  damasco:     ['albaricoque','chabacano'],
  albaricoque: ['damasco','chabacano'],
  durazno:     ['melocotón','melocoton'],
  melocoton:   ['durazno','melocotón'],
  frutilla:    ['fresa'],
  fresa:       ['frutilla'],
  pepino:      ['cohombro'],
  pimentón:    ['pimiento','ají dulce','morron'],
  aji:         ['chile','guindilla'],
  papas:       ['patatas'],
  patatas:     ['papas'],
  cerdo:       ['chancho','puerco'],
  chancho:     ['cerdo','puerco'],
  pavo:        ['guajolote'],
  leche:       ['lácteo'],
  queso:       ['quesillo'],
  quesillo:    ['queso fresco','queso blanco'],
  manjar:      ['dulce de leche','cajeta'],
  merkén:      ['merken','aji cacho de cabra'],
  merken:      ['merkén','aji cacho de cabra'],
  mote:        ['trigo cocido','hominy'],
  cochayuyo:   ['alga marina','kelp'],
  marraqueta:  ['pan francés','baguette chilena'],
  hallulla:    ['pan blandito'],
  sopaipilla:  ['sopaipillas','sopaipa'],
};

/** Expande un query con sus sinónimos chilenos */
const expandSearch = (q) => {
  const terms = [q];
  const words = q.split(' ');
  for (const word of words) {
    const syns = SINONIMOS_CL[word.toLowerCase()];
    if (syns) terms.push(...syns);
  }
  const direct = SINONIMOS_CL[q.toLowerCase()];
  if (direct) terms.push(...direct);
  return [...new Set(terms)];
};

/** Filtra alimentos con sinónimos */
const filterWithSynonyms = (foods, query) => {
  if (query.length < 2) return [];
  const terms = expandSearch(query.toLowerCase());
  return foods.filter(f => {
    const name = f.nombre.toLowerCase();
    return terms.some(t => name.includes(t));
  });
};

const CATS = ["Todas","Lácteos","Carnes","Cecinas","Panes","Cereales","Snacks","Bebidas","Frutas","Verduras","Legumbres","Granos","Pescados","Huevos","Comidas CL","Platos chilenos","Congelados","Comida rápida","Preparados","Aceites","Condimentos","Salsas","Postres","Suplementos","Mis alimentos","Mis recetas","Escaneado"];
const MEALS = ["Desayuno","Almuerzo","Once","Cena","Snack"];
const MC = {Desayuno:"#FF9500",Almuerzo:"#FF3B30",Once:"#AF52DE",Cena:"#D42020",Snack:"#34C759"};
const MI = {Desayuno:"🌅",Almuerzo:"☀️",Once:"☕",Cena:"🌙",Snack:"🍎"};

/* ═══════════════════════════════════════════════════════
   PAUTA NUTRICIONAL — estructura profesional del plan
   Tiempos de comida con nombres profesionales chilenos.
═══════════════════════════════════════════════════════ */
const PAUTA_COMIDAS = [
  {k:'Desayuno',      icon:'🌅', color:'#FF9500', hora:'08:00'},
  {k:'Colación AM',   icon:'🍎', color:'#34C759', hora:'11:00'},
  {k:'Almuerzo',      icon:'☀️', color:'#FF3B30', hora:'13:30'},
  {k:'Once',          icon:'☕', color:'#AF52DE', hora:'17:00'},
  {k:'Cena',          icon:'🌙', color:'#5856D6', hora:'20:30'},
  {k:'Colación PM',   icon:'🌰', color:'#A2845E', hora:'22:00'},
];
const horaDeComida = (k)=> (PAUTA_COMIDAS.find(m=>m.k===k)||{}).hora || '';
const MACRO_KCAL = {prot:4, carbs:4, grasas:9};

/* ═══════════════════════════════════════════════════════
   MICRONUTRIENTES — vitaminas y minerales
   Híbrido: datos reales (por 100g) para alimentos comunes +
   estimación por categoría para el resto. RDA = valor diario
   recomendado adulto (referencia).
═══════════════════════════════════════════════════════ */
const MICROS = [
  {k:'calcio',  l:'Calcio',       u:'mg', rda:1000, e:'🦴'},
  {k:'hierro',  l:'Hierro',       u:'mg', rda:14,   e:'🩸'},
  {k:'potasio', l:'Potasio',      u:'mg', rda:3500, e:'🍌'},
  {k:'magnesio',l:'Magnesio',     u:'mg', rda:400,  e:'✨'},
  {k:'zinc',    l:'Zinc',         u:'mg', rda:11,   e:'🛡️'},
  {k:'vitA',    l:'Vitamina A',   u:'µg', rda:800,  e:'🥕'},
  {k:'vitC',    l:'Vitamina C',   u:'mg', rda:80,   e:'🍊'},
  {k:'vitD',    l:'Vitamina D',   u:'µg', rda:15,   e:'☀️'},
  {k:'b12',     l:'Vitamina B12', u:'µg', rda:2.4,  e:'🧬'},
  {k:'folato',  l:'Folato',       u:'µg', rda:400,  e:'🌿'},
];
// Helper para escribir valores [calcio,hierro,potasio,magnesio,zinc,vitA,vitC,vitD,b12,folato]
const _mc = (a)=>({calcio:a[0],hierro:a[1],potasio:a[2],magnesio:a[3],zinc:a[4],vitA:a[5],vitC:a[6],vitD:a[7],b12:a[8],folato:a[9]});
// Datos REALES por 100 g, asociados por palabra clave en el nombre del alimento
const MICROS_REAL = {
  //                    Ca   Fe   K    Mg   Zn   A    C    D    B12  Folato
  'leche':       _mc([120, 0.03,150, 11,  0.4, 46,  0,   1.3, 0.45,5]),
  'yogur':       _mc([110, 0.05,155, 11,  0.6, 27,  0.5, 0,   0.4, 7]),
  'yoghurt':     _mc([110, 0.05,155, 11,  0.6, 27,  0.5, 0,   0.4, 7]),
  'queso':       _mc([700, 0.2, 120, 29,  3.9, 165, 0,   0.5, 1.5, 21]),
  'huevo':       _mc([56,  1.75,138, 12,  1.3, 160, 0,   2,   0.9, 47]),
  'pollo':       _mc([12,  0.7, 256, 27,  0.9, 9,   0,   0.1, 0.3, 4]),
  'pavo':        _mc([12,  1.4, 250, 28,  1.7, 0,   0,   0.1, 1.6, 9]),
  'vacuno':      _mc([12,  2.6, 320, 21,  4.8, 0,   0,   0.1, 2.6, 6]),
  'carne':       _mc([12,  2.6, 320, 21,  4.8, 0,   0,   0.1, 2.6, 6]),
  'cerdo':       _mc([14,  0.9, 350, 25,  2.4, 2,   0.7, 0.7, 0.7, 5]),
  'salmón':      _mc([12,  0.4, 363, 29,  0.4, 12,  0,   11,  3.2, 26]),
  'atún':        _mc([8,   1,   250, 50,  0.6, 17,  0,   1.7, 2.2, 2]),
  'merluza':     _mc([20,  0.4, 350, 30,  0.4, 10,  0,   1,   1,   7]),
  'reineta':     _mc([20,  0.5, 350, 30,  0.5, 10,  0,   2,   1.5, 7]),
  'palta':       _mc([12,  0.55,485, 29,  0.6, 7,   10,  0,   0,   81]),
  'plátano':     _mc([5,   0.26,358, 27,  0.15,3,   8.7, 0,   0,   20]),
  'naranja':     _mc([40,  0.1, 181, 10,  0.07,11,  53,  0,   0,   30]),
  'manzana':     _mc([6,   0.12,107, 5,   0.04,3,   4.6, 0,   0,   3]),
  'frutilla':    _mc([16,  0.41,153, 13,  0.14,1,   59,  0,   0,   24]),
  'espinaca':    _mc([99,  2.7, 558, 79,  0.5, 469, 28,  0,   0,   194]),
  'acelga':      _mc([51,  1.8, 379, 81,  0.4, 306, 30,  0,   0,   14]),
  'tomate':      _mc([10,  0.27,237, 11,  0.17,42,  14,  0,   0,   15]),
  'zanahoria':   _mc([33,  0.3, 320, 12,  0.24,835, 5.9, 0,   0,   19]),
  'brócoli':     _mc([47,  0.73,316, 21,  0.41,31,  89,  0,   0,   63]),
  'lechuga':     _mc([36,  0.86,194, 13,  0.18,370, 9,   0,   0,   38]),
  'lenteja':     _mc([19,  3.3, 369, 36,  1.3, 0,   1.5, 0,   0,   181]),
  'poroto':      _mc([35,  2.1, 405, 45,  1,   0,   0,   0,   0,   130]),
  'garbanzo':    _mc([49,  2.9, 291, 48,  1.5, 1,   1.3, 0,   0,   172]),
  'arroz':       _mc([10,  0.2, 35,  12,  0.5, 0,   0,   0,   0,   3]),
  'marraqueta':  _mc([30,  1.5, 120, 25,  0.7, 0,   0,   0,   0,   30]),
  'hallulla':    _mc([30,  1.5, 110, 24,  0.7, 0,   0,   0,   0,   28]),
  'pan':         _mc([30,  1.5, 120, 25,  0.7, 0,   0,   0,   0,   30]),
  'avena':       _mc([54,  4.7, 429, 177, 4,   0,   0,   0,   0,   56]),
  'almendra':    _mc([269, 3.7, 733, 270, 3.1, 0,   0,   0,   0,   44]),
  'nuez':        _mc([98,  2.9, 441, 158, 3,   1,   1.3, 0,   0,   98]),
  'maní':        _mc([92,  4.6, 705, 168, 3.3, 0,   0,   0,   0,   240]),
  'quínoa':      _mc([17,  1.5, 172, 64,  1.1, 0,   0,   0,   0,   42]),
  'papa':        _mc([12,  0.8, 421, 23,  0.3, 0,   19.7,0,   0,   15]),
  'choclo':      _mc([2,   0.5, 270, 37,  0.5, 9,   6.8, 0,   0,   42]),
};
// Estimación por CATEGORÍA (por 100 g) para alimentos sin dato real
const MICRO_BY_CAT = {
  'Lácteos':   _mc([120, 0.1, 150, 12,  0.5, 40,  1,   0.8, 0.5, 6]),
  'Carnes':    _mc([12,  2.3, 310, 22,  4,   3,   0,   0.2, 2,   6]),
  'Cecinas':   _mc([10,  1.4, 250, 18,  2,   2,   0,   0.4, 1,   4]),
  'Pescados':  _mc([18,  0.6, 340, 30,  0.5, 12,  0,   4,   2.5, 8]),
  'Huevos':    _mc([56,  1.75,138, 12,  1.3, 160, 0,   2,   0.9, 47]),
  'Verduras':  _mc([40,  1.2, 300, 25,  0.4, 150, 25,  0,   0,   60]),
  'Frutas':    _mc([14,  0.3, 200, 12,  0.1, 30,  25,  0,   0,   20]),
  'Legumbres': _mc([35,  2.8, 380, 43,  1.3, 1,   1,   0,   0,   160]),
  'Cereales':  _mc([25,  1.5, 120, 40,  1,   0,   0,   0,   0,   25]),
  'Panes':     _mc([30,  1.5, 120, 25,  0.7, 0,   0,   0,   0,   30]),
  'Granos':    _mc([15,  1,   120, 30,  0.8, 0,   0,   0,   0,   15]),
  'Frutos secos':_mc([120,3,  600, 180, 3,   1,   0,   0,   0,   60]),
  'Snacks':    _mc([40,  1,   250, 50,  1,   5,   2,   0,   0,   30]),
  'Bebidas':   _mc([8,   0.1, 30,  3,   0.05,0,   2,   0,   0,   2]),
  'Aceites':   _mc([1,   0.1, 1,   0,   0,   0,   0,   0,   0,   0]),
  'Condimentos':_mc([20, 1,   100, 15,  0.3, 20,  5,   0,   0,   10]),
  'Salsas':    _mc([15,  0.6, 150, 12,  0.2, 30,  6,   0,   0,   8]),
  '_default':  _mc([20,  0.7, 150, 18,  0.5, 20,  3,   0,   0.1, 15]),
};
const getMicros100 = (food) => {
  const nameL = (food && food.nombre ? food.nombre : '').toLowerCase();
  for(const kw in MICROS_REAL){ if(nameL.includes(kw)) return {m:MICROS_REAL[kw], real:true}; }
  return {m: MICRO_BY_CAT[food && food.cat] || MICRO_BY_CAT._default, real:false};
};
// Suma de micros sobre un log (escala por gramos realmente consumidos)
const sumMicros = (log) => {
  const acc = {}; MICROS.forEach(x=>acc[x.k]=0);
  let anyEst=false, anyReal=false;
  (log||[]).forEach(it=>{
    const {m,real} = getMicros100(it);
    const g = (it.grams || it.porcion || 100) * (it.qty || 1);
    MICROS.forEach(x=>{ acc[x.k] += (m[x.k]||0) * g / 100; });
    if(real) anyReal=true; else anyEst=true;
  });
  acc._anyEst = anyEst; acc._anyReal = anyReal;
  return acc;
};
const macrosToKcal = (mac={}) =>
  Math.round((+mac.prot||0)*4 + (+mac.carbs||0)*4 + (+mac.grasas||0)*9);

/* Normaliza recomendaciones (compat con formato antiguo en array y nuevo en objeto).
   Devuelve { macros:{prot,carbs,grasas}, comidas:[{comida, items:[{tipo,porcion}]}] } */
const normalizeRecs = (r) => {
  if(r && !Array.isArray(r) && typeof r === 'object'){
    return {
      macros: r.macros || {prot:null,carbs:null,grasas:null},
      comidas: Array.isArray(r.comidas) ? r.comidas : [],
    };
  }
  // Formato antiguo: array plano → todo bajo "Indicaciones generales"
  const items = Array.isArray(r) ? r.filter(x=>x&&(x.tipo||x.porcion)) : [];
  return {
    macros: {prot:null,carbs:null,grasas:null},
    comidas: items.length ? [{comida:'Indicaciones generales', items}] : [],
  };
};
/* Aplana la pauta a un array [{tipo,porcion,comida}] para consumidores legacy */
const recsToArray = (r) => {
  const n = normalizeRecs(r);
  const out = [];
  n.comidas.forEach(c => (c.items||[]).forEach(it => out.push({...it, comida:c.comida, hora:c.hora||''})));
  return out;
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
const calcTDEE = ({peso,altura,edad,sexo,act}) => {
  const p=parseFloat(peso)||70, h=parseFloat(altura)||170, e=parseFloat(edad)||25;
  const bmr = sexo==='M'
    ? 10*p + 6.25*h - 5*e + 5
    : 10*p + 6.25*h - 5*e - 161;
  return Math.round(bmr * (parseFloat(act)||1.375));
};
const RITMOS = {
  tranquilo: {label:'🐢 Tranquilo', desc:'0.25 kg/sem', factor:0.10, color:'#34C759'},
  normal:    {label:'🚶 Normal',    desc:'0.5 kg/sem',  factor:0.20, color:'#FF9500'},
  rapido:    {label:'🏃 Rápido',    desc:'0.75 kg/sem', factor:0.30, color:'#D42020'},
  agresivo:  {label:'🚀 Agresivo',  desc:'1 kg/sem',    factor:0.38, color:'#5856D6'},
};
const JUNAEB = {
  'Puente Alto':    {pct:68,nivel:'muy alto',color:'#FF3B30'},
  'La Pintana':     {pct:71,nivel:'muy alto',color:'#FF3B30'},
  'Cerro Navia':    {pct:69,nivel:'muy alto',color:'#FF3B30'},
  'Lo Espejo':      {pct:70,nivel:'muy alto',color:'#FF3B30'},
  'Maipú':          {pct:65,nivel:'alto',    color:'#FF9500'},
  'La Florida':     {pct:62,nivel:'alto',    color:'#FF9500'},
  'El Bosque':      {pct:67,nivel:'alto',    color:'#FF9500'},
  'Talca':          {pct:63,nivel:'alto',    color:'#FF9500'},
  'Rancagua':       {pct:61,nivel:'alto',    color:'#FF9500'},
  'Antofagasta':    {pct:60,nivel:'alto',    color:'#FF9500'},
  'Arica':          {pct:58,nivel:'alto',    color:'#FF9500'},
  'Temuco':         {pct:57,nivel:'alto',    color:'#FF9500'},
  'Concepción':     {pct:55,nivel:'medio',   color:'#FFD700'},
  'Valparaíso':     {pct:53,nivel:'medio',   color:'#FFD700'},
  'Viña del Mar':   {pct:50,nivel:'medio',   color:'#FFD700'},
  'La Serena':      {pct:51,nivel:'medio',   color:'#FFD700'},
  'Santiago':       {pct:52,nivel:'medio',   color:'#FFD700'},
  'Peñalolén':      {pct:56,nivel:'medio',   color:'#FFD700'},
  'Las Condes':     {pct:38,nivel:'bajo',    color:'#34C759'},
  'Providencia':    {pct:33,nivel:'bajo',    color:'#34C759'},
  'Ñuñoa':          {pct:35,nivel:'bajo',    color:'#34C759'},
  'Vitacura':       {pct:28,nivel:'bajo',    color:'#34C759'},
  'Otra':           {pct:55,nivel:'medio',   color:'#FFD700'},
};
const MOODS = [
  {e:'😊',l:'Feliz',     color:'#34C759'},
  {e:'😐',l:'Neutro',    color:'#8E8E93'},
  {e:'😔',l:'Triste',    color:'#5856D6'},
  {e:'😰',l:'Ansioso/a', color:'#FF9500'},
  {e:'😤',l:'Estresado/a',color:'#FF3B30'},
  {e:'😴',l:'Cansado/a', color:'#AF52DE'},
];

const calcMetas = (tdee, obj, pesoKg=70, ritmo='normal') => {
  /* Déficit/superávit en % del TDEE según ritmo elegido */
  const rFactor = RITMOS[ritmo]?.factor ?? 0.20;
  const ajuste = {
    bajar:   -(rFactor),
    mantener: 0,
    recomp:   0,
    subir:    rFactor * 0.6,
  };
  const d = ajuste[obj] ?? 0;
  const cal = Math.max(tdee * 0.65, Math.round(tdee + tdee*d)); // mínimo 65% TDEE

  /* Proteína: g/kg de peso corporal (ISSN 2023) */
  const protGxKg = {
    bajar:    2.0,  // preservar músculo en déficit
    mantener: 1.4,  // mantenimiento
    recomp:   2.2,  // recomposición requiere más proteína
    subir:    1.8,  // crecimiento muscular
  };
  const prot = Math.round((protGxKg[obj] ?? 1.4) * pesoKg);

  /* Grasas: 25–30% de las calorías totales */
  const grasasPct = obj === 'bajar' ? 0.28 : 0.25;
  const grasas = Math.round(cal * grasasPct / 9);

  /* Carbos: resto de las calorías */
  const calProt  = prot * 4;
  const calGrasa = grasas * 9;
  const carbs = Math.round(Math.max(0, cal - calProt - calGrasa) / 4);

  return {cal, prot, carbs, grasas};
};
const calcSaludScore = (tot, metas, agua, exercises, streak) => {
  let score = 0;
  // Calorías en meta (30 pts)
  if(metas.cal > 0){
    const cp = tot.cal / metas.cal;
    if(cp >= 0.85 && cp <= 1.08) score += 30;
    else if(cp >= 0.65 && cp < 0.85) score += 18;
    else if(cp > 1.08 && cp <= 1.2)  score += 18;
    else if(cp > 0) score += 8;
  }
  // Proteína (20 pts)
  if(metas.prot > 0){
    const pp = tot.prot / metas.prot;
    if(pp >= 0.85) score += 20;
    else if(pp >= 0.6) score += 12;
    else if(pp > 0) score += 5;
  }
  // Agua (15 pts)
  if(agua >= 8) score += 15;
  else if(agua >= 5) score += 9;
  else if(agua >= 2) score += 4;
  // Ejercicio (20 pts)
  const burned = exercises.reduce((s,e)=>s+e.burn,0);
  if(burned >= 300) score += 20;
  else if(burned >= 150) score += 13;
  else if(burned > 0) score += 6;
  // Fibra (15 pts)
  const fib = tot.fibra || 0;
  if(fib >= 25) score += 15;
  else if(fib >= 15) score += 9;
  else if(fib > 0) score += 4;
  return Math.min(100, score);
};

const scoreColor = (s) => s >= 80 ? '#34C759' : s >= 55 ? '#FF9500' : '#FF3B30';
const scoreLabel = (s) => s >= 80 ? '¡Excelente día! 🌟' : s >= 55 ? 'Buen ritmo 💪' : s >= 30 ? 'Sigue sumando ⚡' : 'Empieza a registrar 🌱';

const itemRatio = (i) => i.grams && i.porcion ? i.grams / i.porcion : 1;

/* ── Estilos reutilizables para headers de modales full-screen ── */
const modalHeaderStyle = (C) => ({
  background: C.surface,
  borderBottom: `1px solid ${C.border}`,
  paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
  paddingBottom: '12px',
  paddingLeft: '8px',
  paddingRight: '18px',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
});
const backBtnStyle = (C) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '10px 14px',
  minWidth: 80,
  minHeight: 44,
  background: 'none',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  color: '#D42020',
  fontSize: 16,
  fontWeight: 700,
  WebkitTapHighlightColor: 'transparent',
});
const sumLog = (log) => log.reduce((a,i)=>{
  const r=itemRatio(i);
  return {cal:a.cal+i.cal*r*i.qty,prot:a.prot+i.prot*r*i.qty,carbs:a.carbs+i.carbs*r*i.qty,grasas:a.grasas+i.grasas*r*i.qty,fibra:a.fibra+i.fibra*r*i.qty,azucar:a.azucar+(i.azucar||0)*r*i.qty,
    sodio: a.sodio +(i.sodio ||0)*r*i.qty};
},{cal:0,prot:0,carbs:0,grasas:0,fibra:0,azucar:0,sodio:0});
const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`; // usa hora LOCAL, no UTC
};
/* Convierte un Date a "YYYY-MM-DD" usando hora LOCAL.
   IMPORTANTE: nunca usar el método nativo de Date que va por UTC — eso rompe la racha en Chile. */
const dateToKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
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
const OBJ_ACCENT = {
  bajar:   {light:'#FF3B30', dark:'#FF453A'},
  mantener:{light:'#D42020', dark:'#0A84FF'},
  recomp:  {light:'#AF52DE', dark:'#BF5AF2'},
  subir:   {light:'#34C759', dark:'#30D158'},
};

const LIGHT = {
  bg:'#F2F2F7', surface:'#FFFFFF', surfaceAlt:'#F2F2F7', border:'#E5E5EA',
  primary:'#1C1C1E', primaryMid:'#3A3A3C', primaryLight:'#636366', glow:'#D42020',
  accent:'#D42020', accentLight:'#F04040', gold:'#F5C21A',
  text:'#000000', textSec:'#6D6D72', textMuted:'#C7C7CC',
  navBg:'rgba(255,255,255,0.94)', headerBg:'#FFFFFF',
  red:'#D42020', blue:'#D42020', purple:'#AF52DE', green:'#28B044', amber:'#F5C21A',
  card:'#FFFFFF', cardAlt:'#F2F2F7',
  brandRed:'#D42020', brandGreen:'#28B044', brandGold:'#F5C21A',
};
const DARK = {
  bg:'#000000', surface:'#1C1C1E', surfaceAlt:'#2C2C2E', border:'#38383A',
  primary:'#FFFFFF', primaryMid:'#EBEBF5', primaryLight:'#AEAEB2', glow:'#F04040',
  accent:'#F04040', accentLight:'#FF6B6B', gold:'#FFD93D',
  text:'#FFFFFF', textSec:'#8E8E93', textMuted:'#48484A',
  navBg:'rgba(0,0,0,0.94)', headerBg:'#000000',
  red:'#F04040', blue:'#F04040', purple:'#BF5AF2', green:'#5DD975', amber:'#FFD93D',
  card:'#1C1C1E', cardAlt:'#2C2C2E',
  brandRed:'#F04040', brandGreen:'#5DD975', brandGold:'#FFD93D',
};

/* ═══════════════════════════════════════════════════════
   LOGO
═══════════════════════════════════════════════════════ */
function Logo({size=40}) {
  const id = "lg"+size;
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <defs>
        {/* Background: white with very subtle warm tint */}
        <radialGradient id={id+"bg"} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF"/>
          <stop offset="100%" stopColor="#FAF6F0"/>
        </radialGradient>

        {/* C red: glossy 3D gradient */}
        <linearGradient id={id+"red"} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%"   stopColor="#F04040"/>
          <stop offset="35%"  stopColor="#D42020"/>
          <stop offset="100%" stopColor="#9A0F0F"/>
        </linearGradient>
        {/* C top gloss */}
        <linearGradient id={id+"redhi"} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.30)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>

        {/* Leaf: fresh green */}
        <linearGradient id={id+"leaf"} x1="20%" y1="5%" x2="75%" y2="95%">
          <stop offset="0%"   stopColor="#5DD975"/>
          <stop offset="45%"  stopColor="#28B044"/>
          <stop offset="100%" stopColor="#156B28"/>
        </linearGradient>

        {/* Fruit: citrus yellow-gold */}
        <radialGradient id={id+"fruit"} cx="36%" cy="30%" r="62%">
          <stop offset="0%"   stopColor="#FFF176"/>
          <stop offset="50%"  stopColor="#F5C21A"/>
          <stop offset="100%" stopColor="#B8860A"/>
        </radialGradient>
        <radialGradient id={id+"fhigh"} cx="30%" cy="25%" r="40%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.65)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>

        {/* Shadows */}
        <filter id={id+"cs"} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="5" stdDeviation="12" floodColor="#B01010" floodOpacity="0.30"/>
        </filter>
        <filter id={id+"ls"} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="7" floodColor="#156B28" floodOpacity="0.35"/>
        </filter>
        <filter id={id+"frs"} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="3" dy="5" stdDeviation="9" floodColor="#B8860A" floodOpacity="0.40"/>
        </filter>
      </defs>

      {/* ── BACKGROUND ── */}
      <rect width="512" height="512" rx="112" fill={"url(#"+id+"bg)"}/>
      {/* Thin border */}
      <rect width="512" height="512" rx="112" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2"/>

      {/* ── C LETTER ── 
           Center (256,256), r=150, gap=120° on right
           Start: (331,126)  End: (331,386)
           Sweep counterclockwise (flag=0) large-arc=1
      ── */}
      {/* Shadow layer */}
      <path
        d="M331 126 A150 150 0 1 0 331 386"
        stroke={"url(#"+id+"red)"}
        strokeWidth="80"
        strokeLinecap="round"
        fill="none"
        filter={"url(#"+id+"cs)"}
      />
      {/* Main C */}
      <path
        d="M331 126 A150 150 0 1 0 331 386"
        stroke={"url(#"+id+"red)"}
        strokeWidth="78"
        strokeLinecap="round"
        fill="none"
      />
      {/* Gloss highlight on C */}
      <path
        d="M331 126 A150 150 0 1 0 331 386"
        stroke={"url(#"+id+"redhi)"}
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── LEAF — inside C, left side ── */}
      {/* Leaf body */}
      <ellipse
        cx="208" cy="252" rx="52" ry="64"
        fill={"url(#"+id+"leaf)"}
        transform="rotate(-22 208 252)"
        filter={"url(#"+id+"ls)"}
      />
      {/* Leaf lighter half */}
      <ellipse
        cx="200" cy="243" rx="28" ry="40"
        fill="rgba(150,255,130,0.22)"
        transform="rotate(-22 200 243)"
      />
      {/* Midrib */}
      <path d="M208 192 C207 222 207 262 210 316" stroke="#0D4A1E" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
      {/* Veins */}
      <path d="M206 222 Q189 213 182 205" stroke="#0D4A1E" strokeWidth="2" strokeLinecap="round" opacity="0.75" fill="none"/>
      <path d="M207 244 Q188 237 181 230" stroke="#0D4A1E" strokeWidth="2" strokeLinecap="round" opacity="0.70" fill="none"/>
      <path d="M208 266 Q192 261 186 256" stroke="#0D4A1E" strokeWidth="1.7" strokeLinecap="round" opacity="0.60" fill="none"/>
      <path d="M208 232 Q224 222 230 213" stroke="#156B28" strokeWidth="1.5" strokeLinecap="round" opacity="0.50" fill="none"/>
      <path d="M208 254 Q225 248 232 241" stroke="#156B28" strokeWidth="1.5" strokeLinecap="round" opacity="0.50" fill="none"/>
      {/* Stem */}
      <path d="M208 193 Q204 176 198 163" stroke="#6B4010" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
      <path d="M208 193 Q204 176 198 163" stroke="#A06828" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* ── FRUIT — small, round, near C opening ── */}
      <circle cx="330" cy="258" r="42" fill={"url(#"+id+"fruit)"} filter={"url(#"+id+"frs)"}/>
      {/* Highlight */}
      <circle cx="330" cy="258" r="42" fill={"url(#"+id+"fhigh)"}/>
      {/* Subtle peel texture */}
      <circle cx="330" cy="258" r="42" fill="none" stroke="rgba(160,100,0,0.12)" strokeWidth="1.5"/>
      {/* Fruit nubs */}
      <circle cx="330" cy="218" r="5.5" fill="#D4A010" opacity="0.55"/>
      <circle cx="330" cy="298" r="4.5" fill="#B07808" opacity="0.40"/>
      {/* Ground shadow */}
      <ellipse cx="334" cy="296" rx="26" ry="7" fill="rgba(0,0,0,0.09)"/>
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
  const colors=['#D42020','#F04040','#28B044','#5DD975','#F5C21A','#FFD93D','#FF6B6B','#AF52DE'];
  const particles = useMemo(()=>Array.from({length:55},(_,i)=>({
    id:i,
    color:colors[i%colors.length],
    left:Math.random()*100,
    delay:Math.random()*0.8,
    dur:1.8+Math.random()*1.2,
    size:5+Math.random()*7,
    rotate:Math.random()*360,
    shape:i%3===0?'circle':i%3===1?'rect':'triangle',
  })),[]);
  if(!active) return null;
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
   SPLASH SCREEN — Premium, brand-aligned
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   SISTEMA DE NIVELES Y PUNTOS
══════════════════════════════════════════════ */
const NIVELES = [
  {nivel:1,  nombre:'🌱 Semilla',      xpMin:0,    xpMax:100,  color:'#8E8E93'},
  {nivel:2,  nombre:'🥗 Novato',       xpMin:100,  xpMax:250,  color:'#34C759'},
  {nivel:3,  nombre:'🥦 Aprendiz',     xpMin:250,  xpMax:500,  color:'#30D158'},
  {nivel:4,  nombre:'💪 Constante',    xpMin:500,  xpMax:900,  color:'#FF9500'},
  {nivel:5,  nombre:'🔥 Dedicado',     xpMin:900,  xpMax:1500, color:'#FF6B00'},
  {nivel:6,  nombre:'⚡ Avanzado',     xpMin:1500, xpMax:2500, color:'#D42020'},
  {nivel:7,  nombre:'🏆 Experto',      xpMin:2500, xpMax:4000, color:'#AF52DE'},
  {nivel:8,  nombre:'🌟 Maestro',      xpMin:4000, xpMax:6000, color:'#FFD700'},
  {nivel:9,  nombre:'👑 Elite',        xpMin:6000, xpMax:9000, color:'#FF375F'},
  {nivel:10, nombre:'🚀 Nutri Master', xpMin:9000, xpMax:99999,color:'#D42020'},
];

const getNivel = (xp) => NIVELES.find(n=>xp>=n.xpMin&&xp<n.xpMax) || NIVELES[NIVELES.length-1];

const calcXPDia = (tot, metas, agua, waterGoal, exercises, streak) => {
  let xp = 0;
  if(tot.cal > 0) xp += 10; // registró comidas
  const pct = metas.cal>0?tot.cal/metas.cal:0;
  if(pct>=0.85&&pct<=1.08) xp += 20; // en meta calórica
  if(tot.prot>=metas.prot*0.85) xp += 15; // proteína cumplida
  if(agua>=waterGoal) xp += 10; // agua cumplida
  if(exercises.length>0) xp += 15; // ejercicio registrado
  if(streak.days>=7) xp += 10; // racha 7+ días
  if(streak.days>=30) xp += 20; // racha 30+ días
  return xp;
};

function Splash({onDone}) {
  const [phase,setPhase] = useState(0);
  const [tipIdx,setTipIdx] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(()=>{ onDoneRef.current = onDone; });
  const tips = [
    {emoji:'🇨🇱', text:'400+ productos chilenos'},
    {emoji:'📸', text:'Escanea tu plato con IA'},
    {emoji:'🔥', text:'Racha diaria y logros'},
    {emoji:'🌱', text:'Modo vegano y alérgenos'},
  ];

  useEffect(()=>{
    const t0=setTimeout(()=>setPhase(1), 80);
    const t1=setTimeout(()=>setPhase(2), 700);
    const t2=setTimeout(()=>setPhase(3), 2600);
    const t3=setTimeout(()=>onDoneRef.current(), 3100);
    return ()=>[t0,t1,t2,t3].forEach(clearTimeout);
  },[]);

  useEffect(()=>{
    if(phase<2) return;
    const ti=setInterval(()=>setTipIdx(i=>(i+1)%tips.length), 850);
    return ()=>clearInterval(ti);
  },[phase]);

  return (
    <div style={{
      position:'fixed',inset:0,bottom:'-50px',paddingBottom:'50px',zIndex:100,
      background:'linear-gradient(160deg,#1A0A0A 0%,#0D0505 55%,#0A0205 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      overflow:'hidden',fontFamily:F,
      opacity:phase===3?0:1,
      transform:phase===3?'scale(1.05)':'scale(1)',
      transition:phase===3?'all .5s cubic-bezier(.4,0,.2,1)':'none',
    }}>

      {/* Ambient glow from brand colors */}
      <div style={{
        position:'absolute',inset:'-40%',
        background:'radial-gradient(ellipse at 35% 30%, rgba(212,32,32,0.15) 0%, transparent 55%),radial-gradient(ellipse at 65% 70%, rgba(40,176,68,0.08) 0%, transparent 50%),radial-gradient(ellipse at 55% 45%, rgba(245,194,26,0.06) 0%, transparent 45%)',
        animation:phase>=1?'ambientDrift 10s ease infinite':'none',
        pointerEvents:'none',
      }}/>

      {/* Expanding rings (brand red) */}
      {phase>=1&&[0,1,2].map(i=>(
        <div key={i} style={{
          position:'absolute',
          width:160+i*110,height:160+i*110,
          borderRadius:'50%',
          border:`1.5px solid rgba(212,32,32,${i===0?0.22:i===1?0.12:0.06})`,
          animation:`splashRingOut ${2+i*.5}s ease-out ${i*.25}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* Floating leaf/gold particles */}
      {phase>=1&&Array.from({length:12}).map((_,i)=>{
        const isGold=i%3===0;
        const sz=3+Math.random()*4;
        return <div key={i} style={{
          position:'absolute',
          width:isGold?sz:sz*.6, height:sz,
          borderRadius:isGold?'50%':'50% 0',
          background:isGold?'rgba(245,194,26,0.35)':'rgba(93,217,117,0.3)',
          left:`${10+Math.random()*80}%`,
          top:`${10+Math.random()*80}%`,
          animation:`leafFloat ${4+Math.random()*3}s ease-in-out ${Math.random()*2}s infinite alternate`,
          pointerEvents:'none',
        }}/>;
      })}

      {/* LOGO — hero element with glow */}
      <div style={{
        position:'relative',marginBottom:28,
        animation:phase>=1?'splashLogoIn .9s cubic-bezier(.34,1.56,.64,1) both':'none',
      }}>
        {/* Red glow */}
        <div style={{
          position:'absolute',inset:-35,borderRadius:40,
          background:'radial-gradient(circle, rgba(212,32,32,0.28), rgba(212,32,32,0.06) 50%, transparent 70%)',
          filter:'blur(15px)',
          animation:phase>=1?'glowPulse 2.5s ease-in-out infinite':'none',
        }}/>
        {/* Gold accent glow */}
        <div style={{
          position:'absolute',right:-20,top:'40%',width:60,height:60,borderRadius:'50%',
          background:'radial-gradient(circle, rgba(245,194,26,0.18), transparent 70%)',
          filter:'blur(12px)',
          animation:phase>=1?'glowPulse 3s ease-in-out .5s infinite':'none',
        }}/>
        {/* Green accent glow */}
        <div style={{
          position:'absolute',left:-15,top:'20%',width:50,height:50,borderRadius:'50%',
          background:'radial-gradient(circle, rgba(40,176,68,0.15), transparent 70%)',
          filter:'blur(10px)',
          animation:phase>=1?'glowPulse 3.5s ease-in-out 1s infinite':'none',
        }}/>
        <div style={{
          position:'relative',
          filter:'drop-shadow(0 16px 48px rgba(212,32,32,0.25)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
        }}>
          <Logo size={130}/>
        </div>
      </div>

      {/* Brand name */}
      <div style={{
        textAlign:'center',marginBottom:6,
        animation:phase>=1?'splashTextIn .6s ease .25s both':'none',
      }}>
        <div style={{
          color:'white',fontSize:44,fontWeight:800,fontFamily:F,letterSpacing:'-2px',lineHeight:1,
        }}>Calor<span style={{color:'#D42020'}}>ú</span></div>
      </div>

      {/* Tagline */}
      <div style={{
        textAlign:'center',marginBottom:40,
        animation:phase>=1?'splashTextIn .5s ease .4s both':'none',
      }}>
        <div style={{
          fontSize:14,color:'rgba(255,255,255,0.35)',fontWeight:500,letterSpacing:'1.5px',
          textTransform:'uppercase',fontFamily:F,
        }}>Tu nutrición, a tu ritmo</div>
      </div>

      {/* Loading bar (red → gold) */}
      {phase>=2&&(
        <div style={{
          width:200,height:3,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden',
          animation:'splashTextIn .3s ease both',
        }}>
          <div style={{
            height:'100%',borderRadius:3,
            background:'linear-gradient(90deg,#D42020,#F5C21A)',
            animation:'barFillAnim 1.8s cubic-bezier(.25,.46,.45,.94) both',
            boxShadow:'0 0 12px rgba(212,32,32,0.5)',
          }}/>
        </div>
      )}

      {/* Rotating feature tips */}
      {phase>=2&&(
        <div style={{
          position:'absolute',bottom:95,
          animation:'splashTextIn .4s ease .2s both',
        }}>
          <div key={tipIdx} style={{
            display:'flex',alignItems:'center',gap:8,
            padding:'8px 18px',borderRadius:24,
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.06)',
            animation:'tipFadeIn .35s ease both',
          }}>
            <span style={{fontSize:16}}>{tips[tipIdx].emoji}</span>
            <span style={{color:'rgba(255,255,255,0.45)',fontSize:13,fontWeight:600,fontFamily:F}}>{tips[tipIdx].text}</span>
          </div>
        </div>
      )}

      {/* Progress dots */}
      <div style={{
        position:'absolute',bottom:58,display:'flex',gap:6,
        animation:phase>=2?'splashTextIn .3s ease .3s both':'none',
      }}>
        {tips.map((_,i)=>(
          <div key={i} style={{
            width:tipIdx===i?22:6,height:6,borderRadius:3,
            background:tipIdx===i?'#D42020':'rgba(255,255,255,0.1)',
            transition:'all .4s cubic-bezier(.4,0,.2,1)',
          }}/>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NUTRIBOT — Mascota animada de Calorú con outfits
   outfit: 'chef' | 'crown' | 'sport' | 'huaso' | 'llama' |
           'gorro' | 'navidad' | 'doctor' | 'grad' | 'super' |
           'playa' | 'mago' | 'none'
═══════════════════════════════════════════════════════ */
// Catálogo de vestimentas (para el vestidor de NutriBot)
const NUTRIBOT_OUTFITS = [
  {id:'auto',    emoji:'✨', name:'Automático', desc:'Cambia según tu racha, Pro y fechas especiales'},
  {id:'chef',    emoji:'👨‍🍳', name:'Chef',        desc:'El clásico nutricionista'},
  {id:'crown',   emoji:'👑', name:'Realeza Pro',  desc:'Corona y capa de suscriptor'},
  {id:'sport',   emoji:'🏃', name:'Deportista',   desc:'Camiseta y banda de campeón'},
  {id:'huaso',   emoji:'🇨🇱', name:'Huaso',        desc:'Para las Fiestas Patrias'},
  {id:'llama',   emoji:'🔥', name:'En llamas',    desc:'Racha épica ardiente'},
  {id:'gorro',   emoji:'🧣', name:'Invierno',     desc:'Gorro de lana y bufanda'},
  {id:'navidad', emoji:'🎅', name:'Navidad',      desc:'Gorro de Pascuero'},
  {id:'doctor',  emoji:'🩺', name:'Doctor',       desc:'Bata y estetoscopio'},
  {id:'grad',    emoji:'🎓', name:'Graduado',     desc:'Birrete de graduación'},
  {id:'super',   emoji:'🦸', name:'Superhéroe',   desc:'Capa y antifaz heroico'},
  {id:'playa',   emoji:'😎', name:'Verano',       desc:'Lentes de sol y flotador'},
  {id:'mago',    emoji:'🧙', name:'Mago',         desc:'Sombrero mágico estrellado'},
  {id:'none',    emoji:'🤖', name:'Sin atuendo',  desc:'NutriBot al natural'},
];
function NutriBot({state='idle', size=60, outfit='chef'}) {
  const uid = `nb${size}${outfit}`; // IDs únicos para gradients por instancia
  return (
    <div style={{width:size,height:size,position:'relative',flexShrink:0}}>
      <style>{`
        @keyframes bot-idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes bot-think{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        @keyframes bot-happy{0%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.15) rotate(-6deg)}75%{transform:scale(1.15) rotate(6deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes bot-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.8)}}
        @keyframes bot-antenna{0%,100%{transform:scale(1)}50%{transform:scale(1.4)}}
        @keyframes bot-shadow{0%,100%{transform:scaleX(1);opacity:.15}50%{transform:scaleX(0.7);opacity:.08}}
        @keyframes bot-flame{0%,100%{transform:scaleY(1) rotate(-3deg)}50%{transform:scaleY(1.15) rotate(3deg)}}
        @keyframes bot-crown-gem{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes bot-star{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.2) rotate(15deg)}}
      `}</style>
      <svg width={size} height={size} viewBox="0 0 60 60"
        style={{
          animation: state==='thinking'?'bot-think 0.65s ease-in-out infinite':
                     state==='happy'   ?'bot-happy 0.45s ease-in-out 3':
                     'bot-idle 2.2s ease-in-out infinite',
          filter:`drop-shadow(0 ${size>50?6:3}px ${size>50?10:5}px rgba(212,32,32,0.3))`,
          display:'block',
        }}>
        <defs>
          <radialGradient id={`${uid}-body`} cx="38%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FF5252"/>
            <stop offset="100%" stopColor="#C41A1A"/>
          </radialGradient>
          <radialGradient id={`${uid}-screen`} cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#1C1C2E"/>
            <stop offset="100%" stopColor="#0A0A18"/>
          </radialGradient>
          {/* Crown gradient */}
          <linearGradient id={`${uid}-gold`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE566"/>
            <stop offset="100%" stopColor="#D4920A"/>
          </linearGradient>
          {/* Flame gradient */}
          <linearGradient id={`${uid}-flame`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF3B00"/>
            <stop offset="50%" stopColor="#FF9500"/>
            <stop offset="100%" stopColor="#FFE566"/>
          </linearGradient>
          {/* Huaso hat gradient */}
          <linearGradient id={`${uid}-straw`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0C040"/>
            <stop offset="100%" stopColor="#C8960A"/>
          </linearGradient>
        </defs>

        {/* ── Sombra en el piso ── */}
        <ellipse cx={30} cy={58} rx={13} ry={2} fill="rgba(200,26,26,0.18)" style={{animation:'bot-shadow 2.2s ease-in-out infinite'}}/>

        {/* ══════ OUTFITS que van DETRÁS del cuerpo ══════ */}
        {/* Capa Pro — detrás del cuerpo */}
        {outfit==='crown'&&(
          <path d="M10 25 Q10 52 30 56 Q50 52 50 25 Z" fill="#6B21A8" opacity={0.7}/>
        )}
        {/* Capa de superhéroe — detrás del cuerpo */}
        {outfit==='super'&&(
          <>
            <path d="M12 20 Q6 46 14 56 L20 50 Q16 34 20 22 Z" fill="#1E5FD4" opacity={0.9}/>
            <path d="M48 20 Q54 46 46 56 L40 50 Q44 34 40 22 Z" fill="#1E5FD4" opacity={0.9}/>
          </>
        )}

        {/* ── Antena base ── */}
        <rect x={28} y={6} width={4} height={9} rx={2} fill="#9B1515"/>
        <circle cx={30} cy={5} r={5} fill="#D42020" style={{animation:state==='thinking'?'bot-antenna 0.5s ease-in-out infinite':'none'}}/>
        <circle cx={30} cy={5} r={2.8} fill="#FF5252"/>

        {/* ── Cuerpo ── */}
        <rect x={7} y={15} width={46} height={35} rx={11} fill={`url(#${uid}-body)`}/>
        <ellipse cx={17} cy={21} rx={7} ry={4} fill="rgba(255,255,255,0.2)" transform="rotate(-20 17 21)"/>

        {/* ══════ OUTFITS que van SOBRE el cuerpo (delantero) ══════ */}

        {/* Delantal de chef */}
        {outfit==='chef'&&(
          <>
            {/* Delantal blanco */}
            <rect x={18} y={26} width={24} height={22} rx={4} fill="white" opacity={0.92}/>
            <rect x={18} y={26} width={24} height={22} rx={4} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={0.8}/>
            {/* Lazo del delantal */}
            <path d="M18 29 Q14 27 15 24 Q16 21 18 22 Q20 23 18 26" fill="white" opacity={0.9}/>
            <path d="M42 29 Q46 27 45 24 Q44 21 42 22 Q40 23 42 26" fill="white" opacity={0.9}/>
            <rect x={26} y={26} width={8} height={2} rx={1} fill="rgba(0,0,0,0.12)"/>
            {/* Bolsillo del delantal */}
            <rect x={23} y={33} width={14} height={10} rx={3} fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.08)" strokeWidth={0.6}/>
            {/* Cuchillo y tenedor en el bolsillo */}
            <rect x={27} y={35} width={1.5} height={6} rx={0.8} fill="#8E8E93"/>
            <path d="M31 35 L31 38 Q33 38 33 36.5 Q33 35 31 35Z" fill="#8E8E93"/>
            <rect x={31} y={38} width={1.5} height={3} rx={0.8} fill="#8E8E93"/>
          </>
        )}

        {/* Camiseta deportiva */}
        {outfit==='sport'&&(
          <>
            {/* Camiseta roja con líneas */}
            <rect x={14} y={26} width={32} height={22} rx={5} fill="#D42020" opacity={0.85}/>
            <rect x={14} y={26} width={32} height={22} rx={5} fill="none" stroke="white" strokeWidth={0.8} strokeOpacity={0.4}/>
            {/* Número en la camiseta */}
            <text x={30} y={39} textAnchor="middle" fill="white" fontSize={10} fontWeight={800} fontFamily="system-ui" opacity={0.9}>1</text>
            {/* Rayas en los hombros */}
            <rect x={14} y={26} width={7} height={6} rx={2} fill="white" opacity={0.25}/>
            <rect x={39} y={26} width={7} height={6} rx={2} fill="white" opacity={0.25}/>
          </>
        )}

        {/* Capa de corona Pro */}
        {outfit==='crown'&&(
          <>
            {/* Medallón Pro en el pecho */}
            <circle cx={30} cy={34} r={7} fill={`url(#${uid}-gold)`}/>
            <circle cx={30} cy={34} r={7} fill="none" stroke="#FFE566" strokeWidth={0.8}/>
            <text x={30} y={37.5} textAnchor="middle" fill="#6B21A8" fontSize={7} fontWeight={800} fontFamily="system-ui">PRO</text>
          </>
        )}

        {/* Bata de doctor + estetoscopio */}
        {outfit==='doctor'&&(
          <>
            {/* Bata blanca */}
            <path d="M16 26 L16 48 L26 48 L26 30 L30 33 L34 30 L34 48 L44 48 L44 26 Z" fill="white" opacity={0.95}/>
            <path d="M16 26 L16 48 L26 48 L26 30 L30 33 L34 30 L34 48 L44 48 L44 26 Z" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={0.7}/>
            {/* Estetoscopio */}
            <path d="M25 27 Q25 40 30 42 Q35 40 35 27" stroke="#2C3E50" strokeWidth={1.6} fill="none" strokeLinecap="round"/>
            <circle cx={30} cy={44} r={2.6} fill="#5AC8FA"/>
            <circle cx={30} cy={44} r={2.6} fill="none" stroke="#2C3E50" strokeWidth={0.8}/>
            {/* Bolsillo con lápiz */}
            <rect x={36} y={36} width={6} height={7} rx={1} fill="rgba(0,0,0,0.05)"/>
            <rect x={38} y={33} width={1.4} height={5} rx={0.6} fill="#D42020"/>
          </>
        )}

        {/* Bufanda de invierno */}
        {outfit==='gorro'&&(
          <>
            <rect x={16} y={40} width={28} height={6} rx={3} fill="#1E5FD4" opacity={0.92}/>
            <rect x={16} y={42} width={28} height={1.5} fill="white" opacity={0.4}/>
            <path d="M22 45 L20 53 L25 53 L26 45 Z" fill="#1E5FD4" opacity={0.92}/>
            <rect x={20} y={51} width={5} height={2} fill="#163F8C"/>
          </>
        )}

        {/* Emblema de superhéroe */}
        {outfit==='super'&&(
          <>
            <circle cx={30} cy={34} r={7} fill="#FFD60A"/>
            <circle cx={30} cy={34} r={7} fill="none" stroke="#fff" strokeWidth={0.8}/>
            <path d="M30 29 L33 34 L31 34 L32 39 L27 33 L29 33 Z" fill="#1E5FD4"/>
          </>
        )}

        {/* Flotador de verano */}
        {outfit==='playa'&&(
          <>
            <ellipse cx={30} cy={44} rx={16} ry={6} fill="#FF6B6B" opacity={0.9}/>
            <ellipse cx={30} cy={44} rx={16} ry={6} fill="none" stroke="white" strokeWidth={0.8} strokeOpacity={0.5}/>
            <rect x={21} y={41} width={6} height={6} rx={1} fill="white" opacity={0.85}/>
            <rect x={33} y={41} width={6} height={6} rx={1} fill="white" opacity={0.85}/>
            <ellipse cx={30} cy={43} rx={6} ry={2.4} fill={`url(#${uid}-screen)`} opacity={0.25}/>
          </>
        )}

        {/* Poncho huaso */}
        {outfit==='huaso'&&(
          <>
            {/* Poncho */}
            <path d="M7 22 L7 48 Q7 50 10 50 L20 50 L20 30 Z" fill="#D42020" opacity={0.85}/>
            <path d="M53 22 L53 48 Q53 50 50 50 L40 50 L40 30 Z" fill="#D42020" opacity={0.85}/>
            <rect x={20} y={26} width={20} height={24} rx={2} fill="white" opacity={0.9}/>
            {/* Detalles del poncho */}
            <rect x={20} y={26} width={20} height={2} rx={1} fill="#003087"/>
            <rect x={20} y={44} width={20} height={2} rx={1} fill="#003087"/>
            {/* Estrellas */}
            <text x={30} y={38} textAnchor="middle" fill="#D42020" fontSize={9} fontWeight={800}>★</text>
          </>
        )}

        {/* ── Pantalla / Cara ── */}
        <rect x={11} y={19} width={38} height={24} rx={7} fill={`url(#${uid}-screen)`}/>
        <rect x={11} y={19} width={38} height={24} rx={7} fill="none" stroke="rgba(90,200,250,0.18)" strokeWidth={1}/>

        {/* Expresión según estado */}
        {state==='thinking'?(
          <>
            <circle cx={22} cy={31} r={3.2} fill="#5AC8FA" style={{animation:'bot-pulse 0.55s ease infinite'}}/>
            <circle cx={30} cy={31} r={3.2} fill="#5AC8FA" style={{animation:'bot-pulse 0.55s ease infinite 0.18s'}}/>
            <circle cx={38} cy={31} r={3.2} fill="#5AC8FA" style={{animation:'bot-pulse 0.55s ease infinite 0.36s'}}/>
          </>
        ):state==='happy'?(
          <>
            <ellipse cx={22} cy={28} rx={4} ry={4} fill="#5AC8FA"/>
            <circle cx={23} cy={29} r={2} fill="#0A0A18"/>
            <circle cx={24} cy={28} r={0.9} fill="white"/>
            {/* Pestañas felices */}
            <path d="M18 25 Q22 22 26 25" stroke="#5AC8FA" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
            <ellipse cx={38} cy={28} rx={4} ry={4} fill="#5AC8FA"/>
            <circle cx={39} cy={29} r={2} fill="#0A0A18"/>
            <circle cx={40} cy={28} r={0.9} fill="white"/>
            <path d="M34 25 Q38 22 42 25" stroke="#5AC8FA" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
            <path d="M18 36 Q30 43 42 36" stroke="#32D74B" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
            {/* Mejillas rosadas */}
            <ellipse cx={17} cy={33} rx={3} ry={2} fill="rgba(255,100,100,0.35)"/>
            <ellipse cx={43} cy={33} rx={3} ry={2} fill="rgba(255,100,100,0.35)"/>
          </>
        ):(
          <>
            <ellipse cx={22} cy={29} rx={4} ry={4} fill="#5AC8FA"/>
            <circle cx={23} cy={30} r={2} fill="#0A0A18"/>
            <circle cx={24} cy={29} r={0.9} fill="white"/>
            <ellipse cx={38} cy={29} rx={4} ry={4} fill="#5AC8FA"/>
            <circle cx={39} cy={30} r={2} fill="#0A0A18"/>
            <circle cx={40} cy={29} r={0.9} fill="white"/>
            <path d="M21 37 Q30 41 39 37" stroke="#5AC8FA" strokeWidth={2} fill="none" strokeLinecap="round"/>
          </>
        )}

        {/* ── Brazos ── */}
        <rect x={3} y={24} width={4} height={9} rx={2} fill="#9B1515"/>
        <rect x={53} y={24} width={4} height={9} rx={2} fill="#9B1515"/>

        {/* ── Pies ── */}
        <rect x={13} y={48} width={11} height={8} rx={4} fill="#9B1515"/>
        <rect x={36} y={48} width={11} height={8} rx={4} fill="#9B1515"/>

        {/* ══════ OUTFITS que van ENCIMA de todo (sombreros) ══════ */}

        {/* Gorro de chef */}
        {outfit==='chef'&&(
          <>
            {/* Cuerpo alto del gorro */}
            <rect x={20} y={0} width={20} height={14} rx={4} fill="white"/>
            <rect x={20} y={0} width={20} height={14} rx={4} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={0.6}/>
            {/* Pliegues del gorro */}
            <path d="M22 5 Q25 3 28 5 Q31 7 34 5 Q37 3 38 6" stroke="rgba(0,0,0,0.08)" strokeWidth={0.8} fill="none"/>
            {/* Puff top del gorro */}
            <ellipse cx={30} cy={2} rx={12} ry={5} fill="white"/>
            <ellipse cx={30} cy={2} rx={12} ry={5} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={0.6}/>
            {/* Ala del gorro */}
            <rect x={16} y={12} width={28} height={4} rx={2} fill="white"/>
            <rect x={16} y={12} width={28} height={4} rx={2} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={0.6}/>
            {/* Línea azul del gorro (chef profesional) */}
            <rect x={16} y={14} width={28} height={1.5} rx={0.5} fill="#5AC8FA" opacity={0.6}/>
          </>
        )}

        {/* Corona dorada Pro */}
        {outfit==='crown'&&(
          <>
            {/* Base de la corona */}
            <rect x={16} y={12} width={28} height={5} rx={2} fill={`url(#${uid}-gold)`}/>
            {/* Picos de la corona */}
            <path d="M16 13 L20 5 L24 11 L30 3 L36 11 L40 5 L44 13 Z" fill={`url(#${uid}-gold)`}/>
            <path d="M16 13 L20 5 L24 11 L30 3 L36 11 L40 5 L44 13 Z" fill="none" stroke="#FFE566" strokeWidth={0.5}/>
            {/* Gemas de la corona */}
            <circle cx={20} cy={9} r={2} fill="#FF3B30" style={{animation:'bot-crown-gem 1.4s ease-in-out infinite'}}/>
            <circle cx={30} cy={6} r={2.2} fill="#5AC8FA" style={{animation:'bot-crown-gem 1.4s ease-in-out infinite 0.3s'}}/>
            <circle cx={40} cy={9} r={2} fill="#32D74B" style={{animation:'bot-crown-gem 1.4s ease-in-out infinite 0.6s'}}/>
            {/* Brillo en las gemas */}
            <circle cx={19.5} cy={8.5} r={0.7} fill="white" opacity={0.8}/>
            <circle cx={29.5} cy={5.5} r={0.8} fill="white" opacity={0.8}/>
            <circle cx={39.5} cy={8.5} r={0.7} fill="white" opacity={0.8}/>
          </>
        )}

        {/* Banda deportiva + llamas de racha */}
        {outfit==='sport'&&(
          <>
            {/* Banda roja */}
            <rect x={14} y={12} width={32} height={6} rx={3} fill="#D42020"/>
            <rect x={14} y={12} width={32} height={6} rx={3} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={0.6}/>
            {/* Franja blanca */}
            <rect x={14} y={14.5} width={32} height={1.5} rx={0.5} fill="white" opacity={0.5}/>
          </>
        )}

        {/* Sombrero huaso */}
        {outfit==='huaso'&&(
          <>
            {/* Ala ancha del sombrero */}
            <ellipse cx={30} cy={14} rx={20} ry={3.5} fill={`url(#${uid}-straw)`}/>
            <ellipse cx={30} cy={14} rx={20} ry={3.5} fill="none" stroke="#A07010" strokeWidth={0.6}/>
            {/* Copa del sombrero */}
            <rect x={20} y={2} width={20} height={13} rx={5} fill={`url(#${uid}-straw)`}/>
            <rect x={20} y={2} width={20} height={13} rx={5} fill="none" stroke="#A07010" strokeWidth={0.6}/>
            {/* Banda roja del sombrero */}
            <rect x={20} y={10} width={20} height={4} rx={2} fill="#D42020" opacity={0.9}/>
            {/* Estrella */}
            <text x={30} y={13.5} textAnchor="middle" fill="white" fontSize={3.5} fontWeight={800} style={{animation:'bot-star 2s ease-in-out infinite'}}>★</text>
            {/* Sombreado en la copa */}
            <ellipse cx={26} cy={6} rx={5} ry={3} fill="rgba(255,255,255,0.15)" transform="rotate(-20 26 6)"/>
          </>
        )}

        {/* Llamas de racha épica */}
        {outfit==='llama'&&(
          <>
            {/* Llamas detrás */}
            <path d="M20 15 Q16 8 20 2 Q21 8 25 6 Q22 11 26 8 Q24 13 28 11 Q27 15 30 13" fill={`url(#${uid}-flame)`} opacity={0.7} style={{animation:'bot-flame 0.6s ease-in-out infinite',transformOrigin:'30px 14px'}}/>
            <path d="M40 15 Q44 8 40 2 Q39 8 35 6 Q38 11 34 8 Q36 13 32 11 Q33 15 30 13" fill={`url(#${uid}-flame)`} opacity={0.7} style={{animation:'bot-flame 0.6s ease-in-out infinite 0.15s',transformOrigin:'30px 14px'}}/>
            {/* Llama central más grande */}
            <path d="M24 15 Q22 5 28 0 Q27 7 32 4 Q29 10 34 7 Q31 13 36 11 Q33 15 30 12 Z" fill={`url(#${uid}-flame)`} style={{animation:'bot-flame 0.7s ease-in-out infinite 0.08s',transformOrigin:'30px 14px'}}/>
            {/* Número de racha en las llamas */}
            <circle cx={30} cy={8} r={5} fill="rgba(255,200,0,0.9)"/>
            <text x={30} y={11} textAnchor="middle" fill="#FF3B00" fontSize={6} fontWeight={800} fontFamily="system-ui">🔥</text>
          </>
        )}

        {/* Gorro de lana (invierno) */}
        {outfit==='gorro'&&(
          <>
            <path d="M15 15 Q15 2 30 2 Q45 2 45 15 Z" fill="#1E5FD4"/>
            <path d="M15 15 Q15 2 30 2 Q45 2 45 15 Z" fill="none" stroke="#163F8C" strokeWidth={0.6}/>
            {/* Tejido */}
            <path d="M19 14 Q19 6 23 5" stroke="#163F8C" strokeWidth={0.7} fill="none" opacity={0.5}/>
            <path d="M30 14 Q30 5 30 4" stroke="#163F8C" strokeWidth={0.7} fill="none" opacity={0.5}/>
            <path d="M41 14 Q41 6 37 5" stroke="#163F8C" strokeWidth={0.7} fill="none" opacity={0.5}/>
            {/* Vuelta del gorro */}
            <rect x={13} y={13} width={34} height={5} rx={2.5} fill="#2E6FE4"/>
            <rect x={13} y={13} width={34} height={5} rx={2.5} fill="none" stroke="#163F8C" strokeWidth={0.5}/>
            {/* Pompón */}
            <circle cx={30} cy={1} r={3.5} fill="white"/>
          </>
        )}

        {/* Gorro de Pascuero (navidad) */}
        {outfit==='navidad'&&(
          <>
            <path d="M14 16 Q16 2 40 1 L44 14 Z" fill="#D42020"/>
            <path d="M14 16 Q16 2 40 1 L44 14 Z" fill="none" stroke="#9B1515" strokeWidth={0.5}/>
            {/* Sombra */}
            <path d="M40 1 L44 14 L36 14 Q40 7 40 1 Z" fill="#9B1515" opacity={0.4}/>
            {/* Vuelta blanca */}
            <rect x={12} y={13} width={34} height={5} rx={2.5} fill="white"/>
            {/* Pompón */}
            <circle cx={43} cy={2} r={3.5} fill="white"/>
          </>
        )}

        {/* Birrete de graduación */}
        {outfit==='grad'&&(
          <>
            <rect x={24} y={9} width={12} height={5} rx={1.5} fill="#1C1C2E"/>
            <path d="M14 11 L30 6 L46 11 L30 16 Z" fill="#0A0A18"/>
            <path d="M14 11 L30 6 L46 11 L30 16 Z" fill="none" stroke="#2C2C44" strokeWidth={0.5}/>
            {/* Botón y borla */}
            <circle cx={30} cy={11} r={1.6} fill="#FFD60A"/>
            <path d="M30 11 L40 11 L40 18" stroke="#FFD60A" strokeWidth={1} fill="none"/>
            <path d="M38.5 17 L41.5 17 L40 21 Z" fill="#FFD60A"/>
          </>
        )}

        {/* Sombrero de mago */}
        {outfit==='mago'&&(
          <>
            <path d="M30 -6 L42 14 L18 14 Z" fill="#3B2C7A"/>
            <path d="M30 -6 L42 14 L18 14 Z" fill="none" stroke="#2A1F5C" strokeWidth={0.5}/>
            <ellipse cx={30} cy={14} rx={18} ry={3.5} fill="#3B2C7A"/>
            <ellipse cx={30} cy={14} rx={18} ry={3.5} fill="none" stroke="#2A1F5C" strokeWidth={0.5}/>
            <rect x={20} y={11} width={20} height={3} rx={1} fill="#FFD60A" opacity={0.9}/>
            {/* Estrellas */}
            <text x={30} y={6} textAnchor="middle" fill="#FFD60A" fontSize={5} style={{animation:'bot-star 2s ease-in-out infinite'}}>★</text>
            <text x={26} y={11} textAnchor="middle" fill="#FFE566" fontSize={3}>★</text>
            <text x={35} y={10} textAnchor="middle" fill="#FFE566" fontSize={2.5}>★</text>
          </>
        )}

        {/* Antifaz de superhéroe (sobre la cara) */}
        {outfit==='super'&&(
          <>
            <path d="M14 26 Q30 21 46 26 L46 31 Q40 35 36 31 Q33 28 30 28 Q27 28 24 31 Q20 35 14 31 Z" fill="#1E5FD4" opacity={0.95}/>
            <ellipse cx={22} cy={29} rx={3} ry={2.4} fill="#0A0A18"/>
            <ellipse cx={38} cy={29} rx={3} ry={2.4} fill="#0A0A18"/>
          </>
        )}

        {/* Lentes de sol (sobre la cara) */}
        {outfit==='playa'&&(
          <>
            <rect x={16} y={26} width={11} height={8} rx={3} fill="#1C1C2E"/>
            <rect x={33} y={26} width={11} height={8} rx={3} fill="#1C1C2E"/>
            <rect x={26} y={28} width={8} height={2} rx={1} fill="#1C1C2E"/>
            <rect x={9} y={28} width={7} height={2} rx={1} fill="#1C1C2E"/>
            <rect x={44} y={28} width={7} height={2} rx={1} fill="#1C1C2E"/>
            {/* Reflejo */}
            <path d="M18 28 L21 28 L19 32 L16 32 Z" fill="#5AC8FA" opacity={0.6}/>
            <path d="M35 28 L38 28 L36 32 L33 32 Z" fill="#5AC8FA" opacity={0.6}/>
          </>
        )}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   VESTIDOR DE NUTRIBOT — elegir vestimenta
═══════════════════════════════════════════════════════ */
function OutfitPicker({C, F, current='auto', onPick, onClose}){
  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.5)',
      backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-end',justifyContent:'center',
      animation:'slideUp .2s ease',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%',maxWidth:480,background:C.bg,borderRadius:'26px 26px 0 0',
        padding:'18px 18px calc(24px + env(safe-area-inset-bottom))',
        maxHeight:'82vh',overflowY:'auto',animation:'modalIn .3s cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{width:38,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
          <span style={{fontSize:22}}>👕</span>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:'-.3px',fontFamily:F}}>Vestidor de NutriBot</div>
            <div style={{fontSize:12,color:C.textSec,fontFamily:F}}>Elige cómo se viste tu mascota</div>
          </div>
        </div>
        <div style={{
          display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16,
        }}>
          {NUTRIBOT_OUTFITS.map(o=>{
            const active = current===o.id;
            return (
              <button key={o.id} className="tap" onClick={()=>{onPick(o.id);haptic('success');}} style={{
                background:active?`${C.primary}14`:C.surface,
                border:`2px solid ${active?C.primary:C.border}`,
                borderRadius:18,padding:'12px 6px 10px',cursor:'pointer',fontFamily:F,
                display:'flex',flexDirection:'column',alignItems:'center',gap:4,
                transition:'all .15s',position:'relative',
              }}>
                {active&&<div style={{
                  position:'absolute',top:6,right:6,width:18,height:18,borderRadius:9,
                  background:C.primary,color:'#fff',fontSize:11,fontWeight:800,
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>✓</div>}
                <div style={{height:54,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {o.id==='auto'
                    ? <span style={{fontSize:34}}>✨</span>
                    : o.id==='none'
                      ? <NutriBot state="idle" size={50} outfit="none"/>
                      : <NutriBot state="idle" size={50} outfit={o.id}/>}
                </div>
                <div style={{fontSize:11.5,fontWeight:700,color:active?C.primary:C.text,textAlign:'center',lineHeight:1.2}}>{o.name}</div>
              </button>
            );
          })}
        </div>
        <div style={{fontSize:11,color:C.textMuted,textAlign:'center',marginTop:14,fontFamily:F,lineHeight:1.4}}>
          {NUTRIBOT_OUTFITS.find(o=>o.id===current)?.desc || ''}
        </div>
        <button className="tap" onClick={onClose} style={{
          width:'100%',marginTop:14,padding:'14px',borderRadius:15,border:'none',
          background:C.primary,color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,
        }}>Listo</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EDITOR DE DÍA PASADO — registrar comidas olvidadas
═══════════════════════════════════════════════════════ */
function PastDayEditor({C, F, dateKey, allFoods, supabaseUser, onClose, onLogChange}){
  const [curKey,setCurKey] = useState(dateKey);
  const [dayLog,setDayLog] = useState(()=>
    (LS.get('log_'+dateKey,[])||[]).map(it=>it.uid?it:{...it,uid:Date.now()+Math.random()})
  );
  const [meal,setMeal] = useState('Almuerzo');
  const [q,setQ]       = useState('');
  const [grams,setGrams] = useState('');
  const d = new Date(curKey+'T12:00:00');
  const isToday = curKey===todayKey();
  const results = q.trim().length>1 ? filterWithSynonyms(allFoods, q.trim()).slice(0,14) : [];

  // Navegar entre días (no permite futuro)
  const goDay = (delta)=>{
    const nd=new Date(curKey+'T12:00:00'); nd.setDate(nd.getDate()+delta);
    const nk=dateToKey(nd);
    if(nk>todayKey()) return; // no futuro
    setCurKey(nk); setQ(''); setGrams('');
    setDayLog((LS.get('log_'+nk,[])||[]).map(it=>it.uid?it:{...it,uid:Date.now()+Math.random()}));
    haptic('light');
  };

  const persist = (newLog)=>{
    setDayLog(newLog);
    LS.set('log_'+curKey, newLog);
    if(supabaseUser){
      try{ syncDay(supabaseUser.id, curKey, newLog, LS.get('agua_'+curKey,0), LS.get('ex_'+curKey,[])); }catch(_){}
    }
    onLogChange && onLogChange(curKey, newLog);
  };
  const addItem = (a)=>{
    const g = grams!==''&&+grams>0 ? +grams : null;
    const targetGrams = (g && g!==a.porcion) ? g : null;
    persist([...dayLog, {...a, comida:meal, qty:1, uid:Date.now()+Math.random(), grams:targetGrams}]);
    haptic('add'); setQ(''); setGrams('');
  };
  const delItem = (uid)=>{ persist(dayLog.filter(r=>r.uid!==uid)); haptic('light'); };
  const tot = sumLog(dayLog);

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:90,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      <div style={modalHeaderStyle(C)}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <button onClick={()=>goDay(-1)} style={{background:'none',border:'none',color:C.textSec,fontSize:20,cursor:'pointer',padding:'2px 6px',lineHeight:1}}>‹</button>
          <div style={{fontSize:13.5,fontWeight:700,color:C.text,textAlign:'center',textTransform:'capitalize',minWidth:140}}>
            {isToday?'Hoy':d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})}
          </div>
          <button onClick={()=>goDay(1)} disabled={isToday} style={{background:'none',border:'none',color:isToday?C.border:C.textSec,fontSize:20,cursor:isToday?'default':'pointer',padding:'2px 6px',lineHeight:1}}>›</button>
        </div>
        <div style={{minWidth:60}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {/* Resumen del día */}
        <div style={{background:C.surface,borderRadius:16,padding:'12px 16px',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.textSec,fontWeight:600}}>Total registrado ese día</div>
          <div style={{fontSize:17,fontWeight:800,color:'#D42020'}}>{Math.round(tot.cal)} kcal</div>
        </div>

        {/* Selector de comida */}
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>¿En qué comida?</div>
        <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
          {['Desayuno','Almuerzo','Once','Cena','Snack'].map(m=>(
            <button key={m} className="tap" onClick={()=>{setMeal(m);haptic('light');}} style={{
              flex:'1 1 0',minWidth:64,padding:'9px 6px',borderRadius:12,cursor:'pointer',fontFamily:F,
              border:`1.5px solid ${meal===m?'#D42020':C.border}`,
              background:meal===m?'#D4202012':C.surface,
              color:meal===m?'#D42020':C.textSec,fontSize:11.5,fontWeight:meal===m?800:600,
            }}>{MI[m]} {m}</button>
          ))}
        </div>

        {/* Buscador */}
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Agregar alimento olvidado</div>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar comida…" autoFocus
            style={{flex:1,padding:'12px 14px',border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:15,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          <input value={grams} onChange={e=>setGrams(e.target.value.replace(/[^0-9]/g,''))} placeholder="g" inputMode="numeric"
            style={{width:64,padding:'12px 8px',border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:15,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',textAlign:'center'}}/>
        </div>
        {results.length>0&&(
          <div style={{marginBottom:18}}>
            {results.map(a=>(
              <button key={a.id} className="tap" onClick={()=>addItem(a)} style={{
                width:'100%',textAlign:'left',display:'flex',alignItems:'center',gap:10,
                padding:'10px 12px',marginBottom:6,borderRadius:13,cursor:'pointer',fontFamily:F,
                background:C.surface,border:`1px solid ${C.border}`,
              }}>
                <span style={{fontSize:20}}>{a.emoji}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{a.cal} kcal · {a.porcion||100}g{a.marca&&a.marca!=='Manual'?` · ${a.marca}`:''}</div>
                </div>
                <span style={{fontSize:18,color:'#D42020',fontWeight:800}}>＋</span>
              </button>
            ))}
          </div>
        )}
        {q.trim().length>1&&results.length===0&&(
          <div style={{fontSize:12,color:C.textMuted,textAlign:'center',padding:'14px 0',marginBottom:8}}>Sin resultados para "{q}"</div>
        )}

        {/* Comidas ya registradas ese día */}
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,margin:'8px 0 8px'}}>Registrado ese día</div>
        {dayLog.length===0
          ? <div style={{fontSize:13,color:C.textMuted,textAlign:'center',padding:'24px 0'}}>No hay nada registrado todavía.</div>
          : ['Desayuno','Almuerzo','Once','Cena','Snack'].map(m=>{
              const items=dayLog.filter(r=>r.comida===m);
              if(!items.length) return null;
              return(
                <div key={m} style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:5}}>{MI[m]} {m}</div>
                  {items.map(it=>(
                    <div key={it.uid} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',marginBottom:5,background:C.surface,borderRadius:12,border:`1px solid ${C.border}`}}>
                      <span style={{fontSize:17}}>{it.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{it.nombre}{it.qty>1?` ×${it.qty}`:''}</div>
                        <div style={{fontSize:11,color:C.textSec}}>{Math.round(it.cal*itemRatio(it)*it.qty)} kcal</div>
                      </div>
                      <button className="tap" onClick={()=>delItem(it.uid)} style={{
                        width:28,height:28,borderRadius:9,border:`1px solid ${C.border}`,background:C.surfaceAlt,
                        color:C.textMuted,fontSize:13,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              );
            })}
      </div>
      <div style={{padding:'12px 16px calc(16px + env(safe-area-inset-bottom))',borderTop:`1px solid ${C.border}`,background:C.bg}}>
        <button className="tap" onClick={onClose} style={{width:'100%',padding:'14px',borderRadius:15,border:'none',background:'#D42020',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F}}>Listo ✓</button>
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
  const [accountType,setAccountType]=useState('personal');
  const [comunaOB,setComunaOB]=useState('Otra');
  const C=LIGHT;
  const totalSteps=6;

  const steps=[
    // Step 0: Pantalla de impacto — diferenciadores
    <div key={0} style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#0D0D0D',padding:'40px 24px 32px',gap:0}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
        <Logo size={80}/>
      </div>
      <div style={{textAlign:'center',marginBottom:28}}>
        <div style={{fontSize:11,color:'#D42020',fontWeight:700,letterSpacing:1.5,marginBottom:10,textTransform:'uppercase'}}>La app de nutrición</div>
        <div style={{fontSize:30,fontWeight:800,color:'white',lineHeight:1.15,letterSpacing:'-1px',marginBottom:10}}>Hecha para<br/>los <span style={{color:'#D42020'}}>chilenos</span></div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.6}}>Cazuela, marraqueta, sopaipilla.<br/>Tu comida real, tus macros exactos.</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:28}}>
        {[
          {icon:'🇨🇱', title:'475+ productos chilenos reales', sub:'Lo que ninguna app internacional tiene'},
          {icon:'🤖', title:'IA que registra por ti', sub:'"Me comí un completo con todo" — listo'},
          {icon:'💰', title:'Pro desde $3.500/mes', sub:'La competencia cobra hasta $20.000/mes'},
        ].map(({icon,title,sub})=>(
          <div key={title} style={{display:'flex',alignItems:'center',gap:12,background:'rgba(255,255,255,0.07)',borderRadius:14,padding:'12px 14px'}}>
            <span style={{fontSize:22,flexShrink:0}}>{icon}</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'white',lineHeight:1.2}}>{title}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:'auto'}}>
        <input value={nombre} onChange={e=>setNombre(e.target.value)}
          placeholder="¿Cómo te llamas?"
          style={{
            width:'100%',padding:'16px 20px',borderRadius:18,marginBottom:10,
            border:`2px solid ${nombre?'#D42020':'rgba(255,255,255,0.15)'}`,
            fontSize:17,fontFamily:F,fontWeight:700,color:'white',
            background:'rgba(255,255,255,0.08)',outline:'none',textAlign:'center',
            transition:'border-color .2s',
          }}/>
        <button onClick={()=>nombre.trim()&&setStep(1)} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:nombre.trim()?'#D42020':'rgba(255,255,255,0.15)',color:'white',
          fontSize:16,fontWeight:800,fontFamily:F,cursor:nombre.trim()?'pointer':'default',
          transition:'background .2s',
        }}>Empezar gratis →</button>
      </div>
    </div>,

    // Step 1: Tipo de cuenta
    <div key={1} style={{padding:'32px 24px',display:'flex',flexDirection:'column',gap:20}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12}}>👤</div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,letterSpacing:'-.5px',fontFamily:F}}>¿Cómo usarás Calorú?</div>
        <div style={{fontSize:13,color:C.textSec,marginTop:6,fontFamily:F}}>Puedes cambiar esto después en tu perfil</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {[
          {k:'personal', icon:'👤', title:'Para mí', sub:'Registro personal de nutrición, hábitos y metas', color:'#D42020'},
          {k:'professional', icon:'👩‍⚕️', title:'Soy profesional de salud', sub:'Nutricionista, coach o médico — gestiona pacientes', color:'#1D3557'},
        ].map(({k,icon,title,sub,color})=>(
          <button key={k} onClick={()=>setAccountType(k)} style={{
            padding:'18px',borderRadius:20,textAlign:'left',
            border:`2px solid ${accountType===k?color:C.border}`,
            background:accountType===k?`${color}10`:C.surfaceAlt,
            cursor:'pointer',fontFamily:F,transition:'all .2s',
            display:'flex',alignItems:'center',gap:14,
          }}>
            <div style={{width:52,height:52,borderRadius:16,background:accountType===k?`${color}20`:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:accountType===k?color:C.text}}>{title}</div>
              <div style={{fontSize:12,color:C.textSec,fontWeight:500,marginTop:3,lineHeight:1.4}}>{sub}</div>
            </div>
            {accountType===k&&<div style={{color,fontSize:22,flexShrink:0}}>✓</div>}
          </button>
        ))}
      </div>
      {accountType==='professional'&&(
        <div style={{background:'#1D355710',borderRadius:16,padding:'14px 16px',border:'1px solid #1D355730'}}>
          <div style={{fontSize:12,fontWeight:700,color:'#1D3557',marginBottom:4}}>👩‍⚕️ Plan Profesional</div>
          <div style={{fontSize:11,color:C.textSec,lineHeight:1.5}}>Tendrás acceso a un panel para gestionar pacientes, asignar planes nutricionales y ver estadísticas de seguimiento. También puedes usar Calorú para tu propia nutrición.</div>
        </div>
      )}
      <button onClick={()=>setStep(2)} style={{
        padding:'16px',borderRadius:18,border:'none',
        background:'#D42020',color:'white',
        fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
        boxShadow:'0 6px 20px rgba(212,32,32,0.25)',
      }}>Continuar →</button>
    </div>,

    // Step 2: Perfil físico
    <div key={2} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
      <div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-.5px'}}>Tu perfil, {nombre} 💪</div>
        <div style={{fontSize:13,color:C.textSec,fontFamily:F,fontWeight:500,marginTop:4}}>Necesitamos esto para calcular tus calorías exactas</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[{l:'Peso (kg)',k:'peso'},{l:'Altura (cm)',k:'altura'},{l:'Edad',k:'edad'}].map(({l,k})=>(
          <div key={k} style={k==='edad'?{gridColumn:'1/-1'}:{}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:6,fontFamily:F}}>{l}</div>
            <input type="number" value={perfil[k]}
              onChange={e=>setPerfil({...perfil,[k]:e.target.value===''?'':parseFloat(e.target.value)||0})}
              onFocus={e=>e.target.select()}
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
              background:perfil.sexo===v?'#D42020':C.surfaceAlt,
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
      <button onClick={()=>setStep(3)} style={{padding:'16px',borderRadius:18,border:'none',background:'#D42020',color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer'}}>Continuar →</button>
    </div>,

    // Step 4: Objetivo (was 2) (was 2)
    <div key={3} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
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
      {(()=>{
        const tP=calcTDEE(perfil), mP=calcMetas(tP,obj,parseFloat(perfil.peso)||70);
        const cols={bajar:'#FF3B30',mantener:'#D42020',recomp:'#AF52DE',subir:'#34C759'};
        const col=cols[obj]||'#D42020';
        return(
          <div style={{background:'linear-gradient(135deg,#1A0A0A,#0D0505)',borderRadius:20,padding:'16px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Tu plan personalizado</div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:2}}>Gastas al día</div>
                <div style={{fontSize:24,fontWeight:800,color:'white',lineHeight:1}}>{tP} <span style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>kcal</span></div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginBottom:2}}>Tu meta diaria</div>
                <div style={{fontSize:24,fontWeight:800,color:col,lineHeight:1}}>{mP.cal} <span style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>kcal</span></div>
              </div>
            </div>
            <div style={{display:'flex',gap:6}}>
              {[{l:'Proteína',v:mP.prot,cl:'#FF6B6B'},{l:'Carbos',v:mP.carbs,cl:'#FFD93D'},{l:'Grasas',v:mP.grasas,cl:'#C77DFF'}].map(({l,v,cl})=>(
                <div key={l} style={{flex:1,background:'rgba(255,255,255,.07)',borderRadius:10,padding:'8px',textAlign:'center'}}>
                  <div style={{fontSize:15,fontWeight:800,color:cl,lineHeight:1}}>{v}g</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.3)',marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      <button onClick={()=>setStep(4)} style={{
        padding:'16px',borderRadius:18,border:'none',
        background:'#D42020',
        color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
      }}>Ver mi plan →</button>
    </div>,

    // Step 4: Termómetro por Comuna
    (()=>{
      const data=JUNAEB[comunaOB]||JUNAEB['Otra'];
      const comunas=Object.keys(JUNAEB);
      return(
        <div key={5} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:18}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:8}}>🌡️</div>
            <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-.5px'}}>Tu comunidad</div>
            <div style={{fontSize:13,color:C.textSec,marginTop:4,fontFamily:F}}>¿En qué comuna vives? Te mostramos cómo está tu entorno</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>Tu comuna</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,maxHeight:200,overflowY:'auto'}}>
              {comunas.map(c=>(
                <button key={c} onClick={()=>setComunaOB(c)} style={{
                  padding:'7px 14px',borderRadius:20,cursor:'pointer',fontFamily:F,
                  border:`1.5px solid ${comunaOB===c?data.color:C.border}`,
                  background:comunaOB===c?data.color+'18':C.surfaceAlt,
                  color:comunaOB===c?data.color:C.textSec,
                  fontSize:13,fontWeight:comunaOB===c?700:400,
                  transition:'all .15s',
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{background:'linear-gradient(135deg,#1A0A0A,#0D0505)',borderRadius:20,padding:'18px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>
              Mapa Nutricional Junaeb 2024 · {comunaOB}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:4}}>Escolares con sobrepeso u obesidad</div>
                <div style={{height:12,background:'rgba(255,255,255,.1)',borderRadius:6,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${data.pct}%`,background:data.color,borderRadius:6,transition:'width .6s ease'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  <span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>0%</span>
                  <span style={{fontSize:13,fontWeight:800,color:data.color}}>{data.pct}%</span>
                  <span style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>100%</span>
                </div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:12,padding:'10px 12px',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:4,background:data.color,flexShrink:0}}/>
              <div style={{fontSize:12,color:'rgba(255,255,255,.7)',fontFamily:F}}>
                Riesgo nutricional <strong style={{color:data.color}}>{data.nivel}</strong> en tu comuna
              </div>
            </div>
          </div>
          <div style={{background:C.surfaceAlt,borderRadius:16,padding:'14px 16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>💡 ¿Por qué importa?</div>
            <div style={{fontSize:12,color:C.textSec,lineHeight:1.6}}>
              Los hábitos alimentarios se forman en familia y comunidad. Calorú te ayuda a construir mejores hábitos, uno a la vez — sin importar dónde vives.
            </div>
          </div>
          <button onClick={()=>setStep(5)} style={{
            padding:'16px',borderRadius:18,border:'none',
            background:'#D42020',color:'white',
            fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
          }}>Ver mi proyección →</button>
        </div>
      );
    })(),

    // Step 3: Yo futuro — proyección
    (()=>{
      const tP=calcTDEE(perfil);
      const mP=calcMetas(tP,obj,parseFloat(perfil.peso)||70);
      const pesoActual=parseFloat(perfil.peso)||70;
      const deficit=tP-mP.cal; // kcal/día ahorradas
      const kgSemana=Math.abs(deficit)*7/7700; // 7700 kcal = 1 kg
      const semanas=obj==='bajar'?Math.round(5/Math.max(kgSemana,0.05)):obj==='subir'?Math.round(3/Math.max(kgSemana,0.05)):null;
      const pesoFuturo=obj==='bajar'?Math.max(pesoActual-5,pesoActual*0.85).toFixed(1)
        :obj==='subir'?(pesoActual+3).toFixed(1)
        :pesoActual.toFixed(1);
      const cols={bajar:'#FF3B30',mantener:'#D42020',recomp:'#AF52DE',subir:'#34C759'};
      const acc=cols[obj]||'#D42020';
      const msgs={
        bajar:`En ~${semanas} semanas podrías llegar a ${pesoFuturo} kg`,
        subir:`En ~${semanas} semanas podrías ganar 3 kg de músculo`,
        mantener:'Mantendrás tu peso actual con salud',
        recomp:'Cambiarás grasa por músculo en 8–12 semanas',
      };
      return(
        <div key={6} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:20}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:52,marginBottom:8}}>🔮</div>
            <div style={{fontSize:22,fontWeight:800,color:C.text,letterSpacing:'-.5px',fontFamily:F}}>Tu transformación</div>
            <div style={{fontSize:13,color:C.textSec,marginTop:4,fontFamily:F}}>{nombre}, esto es lo que vas a lograr</div>
          </div>
          {/* Proyección visual */}
          <div style={{background:'linear-gradient(135deg,#0A1628,#122240)',borderRadius:24,padding:'20px',overflow:'hidden',position:'relative'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontWeight:700,textTransform:'uppercase',letterSpacing:.8,marginBottom:16}}>Tu proyección</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Hoy</div>
                <div style={{fontSize:32,fontWeight:800,color:'white',lineHeight:1}}>{pesoActual} <span style={{fontSize:14,color:'rgba(255,255,255,.4)'}}>kg</span></div>
              </div>
              <div style={{flex:1,display:'flex',alignItems:'center',padding:'0 16px'}}>
                <div style={{flex:1,height:2,background:`${acc}40`,borderRadius:2,position:'relative'}}>
                  <div style={{position:'absolute',inset:0,background:`linear-gradient(90deg,transparent,${acc})`,borderRadius:2}}/>
                  {semanas&&<div style={{position:'absolute',top:-16,left:'50%',transform:'translateX(-50%)',fontSize:10,color:acc,fontWeight:700,whiteSpace:'nowrap'}}>{semanas} sem</div>}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Tu meta</div>
                <div style={{fontSize:32,fontWeight:800,color:acc,lineHeight:1}}>{pesoFuturo} <span style={{fontSize:14,color:'rgba(255,255,255,.4)'}}>kg</span></div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.06)',borderRadius:14,padding:'12px 14px'}}>
              <div style={{fontSize:13,color:'white',fontWeight:600,fontFamily:F}}>{msgs[obj]}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:3}}>siguiendo tu plan de {mP.cal} kcal/día</div>
            </div>
          </div>
          {/* Features destacadas */}
          <div style={{background:'#F8F8F8',borderRadius:20,padding:'14px 16px'}}>
            <div style={{fontSize:12,fontWeight:700,color:C.textSec,marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>Lo que te espera</div>
            {[
              {icon:'📸',title:'Escáner de platos con IA',sub:'Foto → calorías en segundos',pro:true},
              {icon:'🤖',title:'Nutri IA',sub:'Registra hablando naturalmente',pro:true},
              {icon:'🔥',title:'Racha diaria',sub:'Construye el hábito — gratis',pro:false},
              {icon:'🇨🇱',title:'475+ productos chilenos',sub:'Cazuela, marraqueta, completo...',pro:false},
              {icon:'📊',title:'Escáner de código de barras',sub:'Cualquier producto empaquetado',pro:false},
            ].map(({icon,title,sub,pro})=>(
              <div key={title} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:36,height:36,borderRadius:10,background:pro?'#D4202012':'#34C75912',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{title}</div>
                  <div style={{fontSize:10,color:C.textSec,marginTop:1}}>{sub}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:6,background:pro?'#D42020':'#34C759',color:'white',flexShrink:0}}>{pro?'PRO':'GRATIS'}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>onDone({nombre:nombre.trim(),perfil,obj,accountType,comuna:comunaOB})} style={{
            padding:'17px',borderRadius:18,border:'none',
            background:'#D42020',color:'white',
            fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
            boxShadow:'0 8px 24px rgba(212,32,32,0.3)',
          }}>¡Comenzar ahora! 🚀</button>
        </div>
      );
    })(),
  ];

  return (
    <div style={{minHeight:'100vh',background:step===0?'#0D0D0D':C.bg,fontFamily:F,overflowY:'auto',transition:'background .3s'}}>
      {/* Safe area + progress bar */}
      <div style={{paddingTop:'env(safe-area-inset-top, 0px)',background:step===0?'#0D0D0D':C.bg}}>
        {step>0&&<div style={{height:3,background:C.border}}>
          <div style={{height:'100%',width:`${step/(totalSteps-1)*100}%`,background:'#D42020',transition:'width .4s ease'}}/>
        </div>}
        {step>0&&(
          <button onClick={()=>setStep(step-1)} style={{
            margin:'4px 12px 0',background:'none',border:'none',
            color:C.textSec,fontSize:15,fontWeight:700,
            cursor:'pointer',fontFamily:F,
            display:'flex',alignItems:'center',gap:6,
            padding:'10px 6px',minHeight:44,
          }}>
            ‹ Atrás
          </button>
        )}
        {step===0&&<div style={{minHeight:44}}/>}
      </div>
      <div style={{animation:'fadeUp .3s ease'}}>
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
  const daysWithData = data.filter(d=>d.cal>0);
  const avg = daysWithData.length > 0 ? Math.round(total/daysWithData.length) : 0;
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
                fill={d.cal===0?C.border:over?C.red:'#D42020'}
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
            <button key={ct} onClick={()=>setSelCat(ct)} style={{flexShrink:0,padding:'5px 12px',borderRadius:20,border:'none',background:selCat===ct?'#D42020':'#D4202018',color:selCat===ct?'white':'#D42020',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>{ct}</button>
          ))}
        </div>
        {/* Exercise grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:16}}>
          {EXERCISES.filter(e=>e.cat===selCat).map(ex=>(
            <button key={ex.id} onClick={()=>setSel(sel?.id===ex.id?null:ex)} className="tap" style={{
              padding:'10px 6px',borderRadius:14,
              border:`1.5px solid ${sel?.id===ex.id?'#D42020':C.border}`,
              background:sel?.id===ex.id?'#D4202014':C.surfaceAlt,
              cursor:'pointer',fontFamily:F,textAlign:'center',
            }}>
              <div style={{fontSize:22,marginBottom:3}}>{ex.emoji}</div>
              <div style={{fontSize:9,fontWeight:600,color:sel?.id===ex.id?'#D42020':C.textSec,lineHeight:1.2}}>{ex.nombre}</div>
            </button>
          ))}
        </div>
        {sel&&(
          <div style={{animation:'fadeUp .2s ease'}}>
            <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:8}}>Duración (minutos)</div>
            <div style={{display:'flex',gap:6,marginBottom:10}}>
              {[10,15,20,30,45,60].map(m=>(
                <button key={m} onClick={()=>setMins(m)} style={{flex:1,padding:'8px 2px',borderRadius:11,border:`1.5px solid ${mins===m?'#D42020':C.border}`,background:mins===m?'#D4202014':C.surfaceAlt,color:mins===m?'#D42020':C.textSec,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>{m}′</button>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <button onClick={()=>setMins(Math.max(1,mins-5))} style={{width:36,height:36,borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:C.textSec,flexShrink:0}}>−</button>
              <input type="number" value={mins} onChange={e=>setMins(Math.max(1,+e.target.value||1))}
                style={{flex:1,padding:'10px',border:`1.5px solid #D42020`,borderRadius:12,fontSize:18,fontWeight:800,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F,textAlign:'center'}}/>
              <span style={{fontSize:13,color:C.textSec}}>min</span>
              <button onClick={()=>setMins(mins+5)} style={{width:36,height:36,borderRadius:10,border:'none',background:'#D42020',fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
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
            <button key={e} onClick={()=>setFood({...food,emoji:e})} style={{flexShrink:0,width:40,height:40,borderRadius:12,border:`2px solid ${food.emoji===e?'#D42020':C.border}`,background:food.emoji===e?'#D4202018':C.surfaceAlt,fontSize:20,cursor:'pointer'}}>{e}</button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          <div style={{gridColumn:'1/-1'}}>
            <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Nombre del alimento</div>
            <input value={food.nombre} onChange={e=>setFood({...food,nombre:e.target.value})}
              placeholder="Ej: Ensalada de mi abuela"
              style={{width:'100%',padding:'12px 14px',border:`1.5px solid ${food.nombre?'#D42020':C.border}`,borderRadius:13,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          </div>
          {[{l:'Porción (g)',k:'porcion'},{l:'Calorías (kcal)',k:'cal',bold:true},{l:'Proteínas (g)',k:'prot'},{l:'Carbohidratos (g)',k:'carbs'},{l:'Grasas (g)',k:'grasas'},{l:'Fibra (g)',k:'fibra'}].map(({l,k,bold})=>(
            <div key={k}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{l}</div>
              <input type="number" min="0" value={food[k]} onChange={e=>setFood({...food,[k]:+e.target.value||0})}
                style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${bold&&food[k]>0?'#D42020':C.border}`,borderRadius:13,fontSize:16,fontWeight:bold?800:600,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
            </div>
          ))}
        </div>
        <button className="tap" onClick={()=>valid&&onSave({...food,id:Date.now()+9000,custom:true})} style={{
          width:'100%',padding:'15px',borderRadius:18,border:'none',
          background:valid?'#D42020':'#C7C7CC',color:'white',
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
function BarcodeScanner({C, F, onFound, onClose, supabaseUser}) {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const doneRef   = useRef(false);
  const timerRef  = useRef(null);

  const [status,  setStatus] = useState('loading');
  const [barcode,  setBarcode] = useState('');
  const [errMsg,  setErrMsg] = useState('');
  const [found,   setFound]  = useState(null);
  const [dbQuery, setDbQuery] = useState('');

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
  /* ── Construir objeto producto desde respuesta OFF ── */
  const buildProduct = (p, barcode) => {
    const n = p.nutriments||{};
    const offLabels = (p.labels_tags||[]).map(l=>l.toLowerCase());
    const offIngred = (p.ingredients_text_es||p.ingredients_text||'').toLowerCase();
    const offCats   = (p.categories_tags||[]).join(' ').toLowerCase();
    const offAllergenTags = [...(p.allergens_tags||[]),...(p.traces_tags||[])].map(t=>t.toLowerCase());
    const detectedAllergens = [...new Set(offAllergenTags.map(t=>OFF_ALLERGEN_MAP[t]).filter(Boolean))];
    const allergensFromIngredients = detectedAllergens.length===0 ? detectAllergensFromIngredients(offIngred) : [];
    const NON_VEGAN_INGR = ['leche','lácteos','mantequilla','crema','queso','yogur','nata','suero','caseína','lactosa','lactosuero','proteína de leche','huevo','huevos','yema','clara de huevo','carne','pollo','vacuno','cerdo','pavo','cordero','salmón','atún','pescado','jamón','tocino','bacon','chorizo','longaniza','cecina','anchoa','miel','gelatina','colágeno','milk','egg','eggs','meat','chicken','beef','pork','fish','tuna','salmon','honey','gelatin','whey','casein','lactose','butter','cream','cheese','lard','anchovy','prawn','shrimp'];
    let veganStatus = null;
    if(offLabels.includes('en:vegan')||offLabels.includes('en:vegan-status-vegan')) veganStatus=true;
    else if(offLabels.some(l=>l.includes('non-vegan')||l.includes('no-vegan'))) veganStatus=false;
    else if(offIngred.length>10) veganStatus=NON_VEGAN_INGR.some(kw=>offIngred.includes(kw))||offCats.match(/dairi|meat|seafood|egg|poultry|fish|pork|beef|chicken|milk/)?false:true;
    else if(offCats.match(/dairi|meat|seafood|egg|poultry|fish|pork|beef|chicken|milk/)) veganStatus=false;
    // Tamaño de porción: serving_quantity es el campo numérico más confiable de OFF
    const serving = parseFloat(p.serving_quantity)
                 || parseFloat(p.serving_size_g)
                 || parseFloat(p.serving_size)   // "30 g" → 30, "30g" → 30
                 || 100;
    const ratio = serving / 100; // factor de escala desde valores _100g

    // Para cada nutriente: usar _serving si OFF lo provee, sino escalar _100g × ratio
    const kcal  = n['energy-kcal_serving']  != null ? n['energy-kcal_serving']  : (n['energy-kcal_100g']||0)  * ratio;
    const prot  = n['proteins_serving']      != null ? n['proteins_serving']      : (n.proteins_100g||0)        * ratio;
    const carbs = n['carbohydrates_serving'] != null ? n['carbohydrates_serving'] : (n.carbohydrates_100g||0)   * ratio;
    const fat   = n['fat_serving']           != null ? n['fat_serving']           : (n.fat_100g||0)             * ratio;
    const fiber = n['fiber_serving']         != null ? n['fiber_serving']         : (n.fiber_100g||0)           * ratio;
    const sugar = n['sugars_serving']        != null ? n['sugars_serving']        : (n['sugars_100g']||0)       * ratio;
    const sodium= n['sodium_serving']        != null ? n['sodium_serving']        : (n.sodium_100g||0)          * ratio;

    return {
      id:Date.now()+Math.random(),
      nombre:p.product_name_es||p.product_name||'Producto escaneado',
      marca:(p.brands||'').split(',')[0].trim()||'Desconocido',
      cat:'Escaneado', porcion: Math.round(serving),
      cal:  Math.round(kcal),
      prot: Math.round(prot  * 10) / 10,
      carbs:Math.round(carbs * 10) / 10,
      grasas:Math.round(fat  * 10) / 10,
      fibra: Math.round(fiber* 10) / 10,
      azucar:Math.round(sugar* 10) / 10,
      sodio: Math.round(sodium * 1000),
      emoji:'📦', barcode, vegan:veganStatus,
      ingredients:offIngred.slice(0,300)||null,
      offLabels:offLabels.slice(0,10),
      detectedAllergens:detectedAllergens.length>0?detectedAllergens:allergensFromIngredients,
      traceAllergens:[...new Set((p.traces_tags||[]).map(t=>OFF_ALLERGEN_MAP[t.toLowerCase()]).filter(Boolean))],
    };
  };

  /* ── Consultar un endpoint OFF con timeout ── */
  const fetchOFF = async(barcode, host) => {
    const ctrl = new AbortController();
    const tid  = setTimeout(()=>ctrl.abort(), 7000);
    try {
      const res  = await fetch(`https://${host}/api/v0/product/${barcode}.json`, {signal:ctrl.signal});
      clearTimeout(tid);
      if(!res.ok) return null;
      const data = await res.json();
      return data.status===1 ? data.product : null;
    } catch { clearTimeout(tid); return null; }
  };

  /* ── Cadena de búsqueda: CL → World → Comunidad → DB local → manual ── */
  const lookup = async(barcode) => {
    setStatus('looking');
    setErrMsg('');
    try {
      // 1️⃣ Open Food Facts Chile
      let p = await fetchOFF(barcode, 'cl.openfoodfacts.org');
      // 2️⃣ Open Food Facts Mundial
      if(!p) p = await fetchOFF(barcode, 'world.openfoodfacts.org');

      if(p) {
        setFound(buildProduct(p, barcode));
        setStatus('found');
        return;
      }

      // 3️⃣ DB Comunitaria Calorú (productos ingresados por otros usuarios)
      try {
        const { data: communityMatch } = await supabase
          .from('community_products')
          .select('*')
          .eq('barcode', String(barcode))
          .single();
        if(communityMatch) {
          // Incrementar contador de escaneos (sin bloquear)
          supabase.from('community_products')
            .update({ times_scanned: (communityMatch.times_scanned||1) + 1 })
            .eq('barcode', String(barcode));
          setFound({...communityMatch, id:Date.now()+Math.random(), cat:'Escaneado', origen:'comunidad'});
          setStatus('found');
          return;
        }
      } catch { /* si falla Supabase, seguir al siguiente paso */ }

      // 4️⃣ Buscar en DB local por código de barras
      const localMatch = DB.find(item =>
        String(item.barcode) === String(barcode)
      );
      if(localMatch) {
        setFound({...localMatch, id:Date.now()+Math.random(), barcode, cat:'Escaneado'});
        setStatus('found');
        return;
      }

      // 5️⃣ No encontrado — mostrar opciones
      setStatus('notfound');
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
                <div style={{fontSize:13,fontWeight:800,color:'#D42020',marginTop:4}}>{found.cal} kcal / {found.porcion}g</div>
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
              }} style={{flex:2,padding:'13px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F}}>Agregar al diario</button>
            </div>
          </div>
        )}

        {/* No encontrado — opciones */}
        {status==='notfound'&&(
          <div style={{padding:'8px 0',animation:'fadeUp .25s ease'}}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:6}}>🔍</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Producto no encontrado</div>
              <div style={{fontSize:12,color:C.textSec,lineHeight:1.4,marginBottom:12}}>No está en Open Food Facts Chile ni mundial. Búscalo en nuestra base o ingrésalo manual.</div>
            </div>
            <input
              placeholder="🔍 Buscar en base Calorú (ej: marraqueta, Colun...)"
              value={dbQuery} onChange={e=>setDbQuery(e.target.value)} autoFocus
              style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',marginBottom:8}}
            />
            {dbQuery.length>1&&DB.filter(f=>f.nombre.toLowerCase().includes(dbQuery.toLowerCase())||f.marca?.toLowerCase().includes(dbQuery.toLowerCase())).slice(0,6).map(f=>(
              <button key={f.id} className="tap" onClick={()=>{onFound({...f,id:Date.now()+Math.random(),barcode,cat:'Escaneado',origen:'escaneado'}); haptic('success');}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:13,border:`1px solid ${C.border}`,background:C.surfaceAlt,marginBottom:6,cursor:'pointer',fontFamily:F,textAlign:'left'}}>
                <span style={{fontSize:22}}>{f.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{f.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{f.marca} · {f.cal} kcal / {f.porcion}g</div>
                </div>
              </button>
            ))}
            {dbQuery.length>1&&DB.filter(f=>f.nombre.toLowerCase().includes(dbQuery.toLowerCase())||f.marca?.toLowerCase().includes(dbQuery.toLowerCase())).length===0&&(
              <div style={{fontSize:12,color:C.textSec,textAlign:'center',padding:'8px 0 4px'}}>Sin resultados en la base local.</div>
            )}
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button className="tap" onClick={retry} style={{flex:1,padding:'11px',borderRadius:14,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>🔄 Reintentar</button>
              <button className="tap" onClick={()=>setStatus('manual')} style={{flex:1,padding:'11px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>✏️ Ingresar manual</button>
            </div>
          </div>
        )}

        {/* Error de red */}
        {status==='error'&&(
          <div style={{padding:'8px 0 8px',animation:'fadeUp .25s ease'}}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:36,marginBottom:8}}>😕</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Error de conexión</div>
              <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:14}}>{errMsg}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="tap" onClick={retry} style={{flex:1,padding:'12px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>🔄 Reintentar</button>
              <button className="tap" onClick={()=>setStatus('manual')} style={{flex:1,padding:'12px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>✏️ Ingresar manual</button>
            </div>
          </div>
        )}
        {status==='manual'&&(
          <ManualEntry C={C} F={F} barcode={barcode} supabaseUser={supabaseUser} onBack={()=>setStatus('notfound')}
            onSave={(food)=>{onFound({...food,origen:'escaneado'}); haptic('success');}}/>
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
    ? filterWithSynonyms(allFoods, search).slice(0,15)
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
            <button key={e} onClick={()=>setEmoji(e)} style={{flexShrink:0,width:38,height:38,borderRadius:11,border:`2px solid ${emoji===e?'#D42020':C.border}`,background:emoji===e?'#D4202018':C.surfaceAlt,fontSize:20,cursor:'pointer'}}>{e}</button>
          ))}
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre de la receta"
          style={{width:'100%',padding:'12px 14px',border:`1.5px solid ${name?'#D42020':C.border}`,borderRadius:13,fontSize:15,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none',marginBottom:14}}/>

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
                  <span style={{fontSize:16,color:'#D42020'}}>+</span>
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
                  <button onClick={()=>setIngrs(ingrs.map((x,j)=>j===i?{...x,gramsR:x.gramsR+10}:x))} style={{width:26,height:26,borderRadius:7,border:'none',background:'#D42020',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                </div>
                <button onClick={()=>setIngrs(ingrs.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:C.red,fontSize:14,cursor:'pointer',padding:2,flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {ingrs.length>0&&(
          <div style={{background:'#D420200C',borderRadius:14,padding:'12px 14px',marginBottom:14,border:'1px solid #D4202025'}}>
            <div style={{fontSize:11,color:C.textSec,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Total de la receta</div>
            <div style={{display:'flex',gap:10}}>
              {[{l:'Kcal',v:Math.round(totals.cal)},{l:'Prot',v:Math.round(totals.prot)+'g'},{l:'Carbs',v:Math.round(totals.carbs)+'g'},{l:'Grasas',v:Math.round(totals.grasas)+'g'}].map(({l,v})=>(
                <div key={l} style={{flex:1,textAlign:'center'}}>
                  <div style={{fontSize:15,fontWeight:800,color:'#D42020',lineHeight:1}}>{v}</div>
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
        }} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:valid?'#D42020':'#C7C7CC',color:'white',fontSize:15,fontWeight:700,fontFamily:F,cursor:valid?'pointer':'default'}}>
          Guardar receta
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WEEKLY PLANNER + SHOPPING LIST
═══════════════════════════════════════════════════════ */
function WeeklyPlanner({C, F, allFoods, onClose, onApplyToday}) {
  const [plan, setPlan]      = useState(()=>{ try{return JSON.parse(localStorage.getItem('caloru_weekplan')||'{}')}catch{return {}} });
  const [pickSlot, setPickSlot] = useState(null); // {dayKey, meal}
  const [search, setSearch]  = useState('');
  const [view, setView]      = useState('plan'); // plan | shopping

  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-d.getDay()+1+i);
    return {key:dateToKey(d), label:d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric'})};
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

  const filtered = search.length>1 ? filterWithSynonyms(allFoods, search).slice(0,12) : [];

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:80,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      {/* Header */}
      <div style={{...modalHeaderStyle(C), gap:10}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>
          {view==='plan'?'🗓️ Plan semanal':'🛒 Lista de compras'}
        </div>
        <button onClick={()=>setView(view==='plan'?'shopping':'plan')} style={{background:'#D4202018',border:'none',padding:'6px 10px',borderRadius:12,fontSize:11,fontWeight:700,color:'#D42020',cursor:'pointer',fontFamily:F,flexShrink:0,minHeight:44}}>
          {view==='plan'?'🛒':'🗓️'}
        </button>
      </div>

      {/* Apply today's plan — solo visible en vista plan */}
      {view==='plan'&&(()=>{
        const todayKey2=todayKey();
        const todayPlan=plan[todayKey2];
        const totalFoods=todayPlan?Object.values(todayPlan).flat().length:0;
        if(!totalFoods) return null;
        return(
          <div style={{background:'#34C75914',borderBottom:`1px solid #34C75930`,padding:'10px 16px',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <span style={{fontSize:18}}>✨</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:'#34C759'}}>Tienes {totalFoods} alimento{totalFoods>1?'s':''} planificados para hoy</div>
              <div style={{fontSize:10,color:C.textSec,marginTop:1}}>Aplícalos al diario con un toque</div>
            </div>
            <button className="tap" onClick={()=>onApplyToday(todayPlan)} style={{
              padding:'8px 14px',borderRadius:13,border:'none',
              background:'#34C759',color:'white',fontSize:12,fontWeight:700,
              cursor:'pointer',fontFamily:F,flexShrink:0,
            }}>Aplicar hoy</button>
          </div>
        );
      })()}

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px'}}>
        {view==='plan'&&(
          <>
            {days.map(({key,label})=>(
              <div key={key} style={{marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:key===todayKey()?800:700,color:key===todayKey()?'#D42020':C.textSec,textTransform:'uppercase',letterSpacing:.4}}>{label}</div>
                {key===todayKey()&&<span style={{fontSize:9,fontWeight:700,background:'#D42020',color:'white',padding:'2px 8px',borderRadius:8}}>HOY</span>}
              </div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {['Desayuno','Almuerzo','Once','Cena','Snack'].map(meal=>{
                    const items=plan[key]?.[meal]||[];
                    const cal=items.reduce((s,f)=>s+(f.cal*(f.grams&&f.porcion?f.grams/f.porcion:1)*(f.qty||1)),0);
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
                        <button onClick={()=>setPickSlot({dayKey:key,meal})} style={{width:28,height:28,borderRadius:8,border:'none',background:'#D4202018',color:'#D42020',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
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
                    <div style={{fontSize:11,fontWeight:700,color:'#D42020',flexShrink:0}}>{item.cal} kcal/p</div>
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
                <span style={{fontSize:16,color:'#D42020',fontWeight:700}}>+</span>
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
   RESUMEN SEMANAL
═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   MACRO DETAIL SHEET
═══════════════════════════════════════════════════════ */
function MacroDetailSheet({macro, log, metas, C, F, onClose}) {
  if(!macro) return null;
  const {key, label, icon, color, meta, unit='g'} = macro;

  // Calcular aporte de cada alimento para este macro
  const items = log
    .map(item => {
      const ratio = item.grams && item.porcion ? item.grams/item.porcion : 1;
      const raw = key==='cal' ? item.cal : (item[key]||0);
      const val = Math.round(raw * ratio * item.qty * 10) / 10;
      return {...item, macroVal: val};
    })
    .filter(item => item.macroVal > 0)
    .sort((a,b) => b.macroVal - a.macroVal);

  const total = Math.round(items.reduce((s,i)=>s+i.macroVal,0)*10)/10;
  const pct   = meta>0 ? Math.round(total/meta*100) : 0;
  const isOver= meta>0 && total>meta;
  const barColor = isOver ? '#FF3B30' : color;

  // Top fuente y distribución por comida
  const mealTotals = {};
  const MEALS_ORDER = ['Desayuno','Almuerzo','Once','Cena','Snack'];
  items.forEach(i=>{mealTotals[i.comida]=(mealTotals[i.comida]||0)+i.macroVal;});

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:200,
      display:'flex',flexDirection:'column',justifyContent:'flex-end',
    }}>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',backdropFilter:'blur(2px)'}}
      />
      {/* Sheet */}
      <div style={{
        position:'relative',
        background:C.bg,
        borderRadius:'24px 24px 0 0',
        maxHeight:'88vh',
        display:'flex',flexDirection:'column',
        animation:'fadeUp .28s cubic-bezier(.34,1.56,.64,1)',
        overflow:'hidden',
      }}>
        {/* Handle */}
        <div style={{flexShrink:0,display:'flex',justifyContent:'center',padding:'10px 0 0'}}>
          <div style={{width:38,height:4,borderRadius:2,background:C.border}}/>
        </div>

        {/* Header */}
        <div style={{
          flexShrink:0,padding:'12px 20px 14px',
          borderBottom:`1px solid ${C.border}`,
          background:C.surface,
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{
                width:42,height:42,borderRadius:13,
                background:`${color}18`,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
              }}>{icon}</div>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:C.text,letterSpacing:'-.3px'}}>{label}</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>
                  {items.length} alimento{items.length!==1?'s':''} · hoy
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width:32,height:32,borderRadius:10,border:`1px solid ${C.border}`,
              background:C.surfaceAlt,fontSize:14,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',color:C.textMuted,
            }}>✕</button>
          </div>

          {/* Total + barra */}
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:8}}>
            <div>
              <div style={{fontSize:30,fontWeight:800,color:isOver?'#FF3B30':C.text,lineHeight:1,letterSpacing:'-1px'}}>
                {total}<span style={{fontSize:14,color:C.textMuted,fontWeight:500}}>{unit}</span>
              </div>
              {meta>0&&(
                <div style={{fontSize:12,color:isOver?'#FF3B30':C.textSec,fontWeight:600,marginTop:2}}>
                  {isOver
                    ? `${Math.round(total-meta)}${unit} por encima de la meta`
                    : `${Math.round(meta-total)}${unit} restantes de ${meta}${unit}`
                  }
                </div>
              )}
            </div>
            {meta>0&&(
              <div style={{
                background:isOver?'#FF3B3018':`${color}14`,
                borderRadius:12,padding:'5px 12px',
                fontSize:15,fontWeight:800,
                color:isOver?'#FF3B30':color,
              }}>{pct}%</div>
            )}
          </div>
          {meta>0&&(
            <div style={{height:6,background:C.border,borderRadius:6,overflow:'hidden'}}>
              <div style={{
                height:'100%',
                width:`${Math.min(pct,100)}%`,
                background:barColor,borderRadius:6,
                transition:'width .6s cubic-bezier(.25,.46,.45,.94)',
              }}/>
              {isOver&&(
                <div style={{
                  position:'absolute',
                  height:6,width:`${Math.min((total-meta)/meta*100,30)}%`,
                  background:'#FF3B30',borderRadius:6,right:0,top:0,opacity:.5,
                }}/>
              )}
            </div>
          )}
        </div>

        {/* Lista scrollable */}
        <div style={{flex:1,overflowY:'auto',padding:'14px 16px 32px'}}>
          {items.length===0?(
            <div style={{textAlign:'center',padding:'40px 20px',color:C.textMuted}}>
              <div style={{fontSize:36,marginBottom:8}}>{icon}</div>
              <div style={{fontSize:13,fontWeight:600}}>No hay registros hoy</div>
            </div>
          ):(
            <>
              {/* Distribución por comida (si hay más de 1 comida) */}
              {Object.keys(mealTotals).length>1&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:.6,marginBottom:8}}>Por comida</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {MEALS_ORDER.filter(m=>mealTotals[m]).map(m=>(
                      <div key={m} style={{
                        background:C.surface,borderRadius:12,padding:'6px 10px',
                        border:`1px solid ${C.border}`,
                      }}>
                        <div style={{fontSize:9,color:C.textMuted,fontWeight:500,marginBottom:1}}>{m}</div>
                        <div style={{fontSize:13,fontWeight:800,color:color}}>
                          {Math.round(mealTotals[m]*10)/10}<span style={{fontSize:9,color:C.textMuted}}>{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:.6,marginBottom:8}}>
                Desglose por alimento
              </div>

              {items.map((item,i)=>{
                const pctItem = total>0 ? Math.round(item.macroVal/total*100) : 0;
                return (
                  <div key={item.uid} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'11px 0',
                    borderBottom: i<items.length-1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    {/* Rank */}
                    <div style={{
                      width:22,height:22,borderRadius:7,flexShrink:0,
                      background: i===0?`${color}20`:C.surfaceAlt,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:11,fontWeight:800,
                      color: i===0?color:C.textMuted,
                    }}>{i+1}</div>

                    {/* Emoji */}
                    <div style={{fontSize:22,flexShrink:0,lineHeight:1}}>{item.emoji}</div>

                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{
                        fontSize:12,fontWeight:700,color:C.text,
                        whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                        lineHeight:1.3,
                      }}>{item.nombre}</div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>
                        {item.comida} · {item.grams||item.porcion||100}g
                        {item.qty>1?` ×${item.qty}`:''}
                      </div>
                      {/* Mini barra */}
                      <div style={{marginTop:5,height:3,background:C.border,borderRadius:2,overflow:'hidden',width:'100%'}}>
                        <div style={{
                          height:'100%',
                          width:`${pctItem}%`,
                          background:`${color}90`,
                          borderRadius:2,
                          transition:'width .4s ease',
                        }}/>
                      </div>
                    </div>

                    {/* Valor */}
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:800,color:color,lineHeight:1}}>
                        {item.macroVal}<span style={{fontSize:9,color:C.textMuted}}>{unit}</span>
                      </div>
                      <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{pctItem}%</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeeklySummary({C, F, metas, streak, xpTotal, onClose}) {
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=dateToKey(d);
    const dayLog=LS.get('log_'+key,[]);
    const exs=LS.get('ex_'+key,[]);
    const s=sumLog(dayLog);
    return {
      key, label:d.toLocaleDateString('es-CL',{weekday:'short'}),
      cal:Math.round(s.cal), prot:Math.round(s.prot),
      burned:exs.reduce((t,e)=>t+e.burn,0),
      logged:dayLog.length>0,
      isToday:key===todayKey(),
    };
  });
  const logged  = days.filter(d=>d.logged).length;
  const onGoal  = days.filter(d=>d.cal>0&&d.cal<=metas.cal).length;
  const avgCal  = Math.round(days.filter(d=>d.cal>0).reduce((s,d)=>s+d.cal,0)/Math.max(1,logged));
  const burned  = days.reduce((s,d)=>s+d.burned,0);
  const xpWeek  = days.reduce((s,d)=>s+LS.get('xpHoy_'+d.key,0),0);
  const maxCal  = Math.max(...days.map(d=>d.cal),metas.cal,100);
  const score   = Math.round((logged/7)*40+(onGoal/Math.max(1,logged))*40+Math.min(streak.days/7,1)*20);

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:85,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      <div style={modalHeaderStyle(C)}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📊 Resumen semanal</div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

        {/* Score hero */}
        <div style={{background:'linear-gradient(145deg,#1A2C22,#0D1710)',borderRadius:24,padding:'22px',marginBottom:14}}>
          <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18}}>
            <div style={{width:80,height:80,borderRadius:'50%',
              background:`conic-gradient(#34C759 ${score*3.6}deg,rgba(255,255,255,0.08) 0deg)`,
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'#1A2C22',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:22,fontWeight:800,color:'white',lineHeight:1}}>{score}</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.4)'}}>pts</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:'white',marginBottom:4}}>
                {score>=80?'🏆 Excelente':score>=60?'💪 Muy bien':score>=40?'👍 Bien':'🌱 Mejorando'}
              </div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',lineHeight:1.5}}>
                {logged}/7 días registrados<br/>
                {onGoal} días en meta · Racha: {streak.days} días
              </div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div style={{display:'flex',gap:5,alignItems:'flex-end',height:56}}>
            {days.map(d=>{
              const h=d.cal>0?Math.max(5,Math.round((d.cal/maxCal)*52)):3;
              return(
                <div key={d.key} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                  <div style={{width:'100%',height:h,borderRadius:4,
                    background:d.isToday?'#6ECC8A':d.cal>metas.cal?'#FF3B30':'rgba(255,255,255,0.3)',
                    transition:'height .5s ease'}}/>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.4)',fontWeight:d.isToday?700:400}}>{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[
            {icon:'🔥',l:'Promedio diario',v:`${avgCal} kcal`,c:'#FF9500'},
            {icon:'🎯',l:'Días en meta',v:`${onGoal}/7`,c:'#34C759'},
            {icon:'💪',l:'Kcal quemadas',v:`${burned}`,c:'#D42020'},
            {icon:'📈',l:'Racha actual',v:`${streak.days} días`,c:'#AF52DE'},
            {icon:'⭐',l:'Nivel',v:getNivel(xpTotal).nombre,c:getNivel(xpTotal).color},
            {icon:'✨',l:'XP esta semana',v:`${xpWeek} XP`,c:'#FFD700'},
          ].map(({icon,l,v,c2=null,c})=>(
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
                <div style={{fontSize:13,fontWeight:d.isToday?700:500,color:d.isToday?'#D42020':C.text}}>{d.label}{d.isToday?' (hoy)':''}</div>
                {d.logged?<div style={{fontSize:11,color:C.textSec}}>{d.cal} kcal{d.burned>0?` · 🔥${d.burned}`:''}</div>
                  :<div style={{fontSize:11,color:C.textMuted}}>Sin registro</div>}
              </div>
              {d.cal>0&&<div style={{width:56,height:4,background:C.border,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.min(d.cal/metas.cal*100,100)}%`,background:d.cal>metas.cal?'#FF3B30':'#34C759',borderRadius:3}}/>
              </div>}
            </div>
          ))}
        </div>

        {/* Mensaje motivacional */}
        <div style={{background:score>=60?'#34C75914':'#D4202014',borderRadius:18,padding:'16px',
          border:`1px solid ${score>=60?'#34C75940':'#D4202040'}`,textAlign:'center'}}>
          <div style={{fontSize:28,marginBottom:8}}>{score>=80?'🏆':score>=60?'💪':score>=40?'📈':'🌱'}</div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>
            {score>=80?'¡Semana increíble!'
             :score>=60?'¡Muy buen trabajo!'
             :score>=40?'¡Vas por buen camino!'
             :'¡La próxima semana mejor!'}
          </div>
          <div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>
            {score>=80?`Registraste ${logged} días y cumpliste tu meta ${onGoal} veces.`
             :score>=60?`${logged} días registrados. Con más constancia llegas al 100.`
             :`Cada día que registras es un día que avanzas.`}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   COMPARTIR LOGRO — card de milestone (racha, meta, etc.)
═══════════════════════════════════════════════════════ */
function ShareAchievementModal({C, F, achievement, onClose}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  const CONFIGS = {
    streak_3:   {emoji:'⚡', titulo:'¡3 días seguidos!',    desc:'Estás construyendo el hábito',  grad:['#FF9500','#FF6B35']},
    streak_7:   {emoji:'🔥', titulo:'¡1 semana de racha!',  desc:'Primera semana completa 💪',     grad:['#D42020','#FF6B35']},
    streak_14:  {emoji:'🔥', titulo:'¡2 semanas seguidas!', desc:'La constancia es tu superpoder', grad:['#D42020','#8B0000']},
    streak_21:  {emoji:'💎', titulo:'¡21 días seguidos!',   desc:'Ya es un hábito real 🎉',        grad:['#5856D6','#AF52DE']},
    streak_30:  {emoji:'🏆', titulo:'¡30 días de racha!',   desc:'Un mes sin parar. Eres increíble',grad:['#FFD700','#FF9500']},
    streak_50:  {emoji:'🏆', titulo:'¡50 días de racha!',   desc:'Nivel elite. Muy pocos llegan',   grad:['#FFD700','#34C759']},
    streak_100: {emoji:'👑', titulo:'¡100 días de racha!',  desc:'Leyenda de Calorú 🇨🇱',           grad:['#FFD700','#D42020']},
    goal_daily: {emoji:'🎯', titulo:'¡Meta del día!',        desc:'Cerraste el día en tu objetivo',  grad:['#34C759','#007AFF']},
  };

  const cfg = CONFIGS[achievement?.key] || {emoji:'⭐', titulo:'¡Logro desbloqueado!', desc:'Sigue así', grad:['#5856D6','#D42020']};

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const W=400, H=400;
    canvas.width=W; canvas.height=H;

    // Fondo gradiente
    const bg = ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0, cfg.grad[0]); bg.addColorStop(1, cfg.grad[1]);
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Patrón sutil
    ctx.fillStyle='rgba(255,255,255,0.05)';
    for(let x=0;x<W;x+=28) for(let y=0;y<H;y+=28){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}

    // Badge app
    ctx.fillStyle='rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.roundRect(16,16,110,28,14); ctx.fill();
    ctx.fillStyle='white'; ctx.font='bold 12px system-ui';
    ctx.fillText('🍽️ Calorú',26,34);

    // Fecha
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='11px system-ui'; ctx.textAlign='right';
    ctx.fillText(new Date().toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric'}),W-18,34);
    ctx.textAlign='left';

    // Emoji grande
    ctx.font='90px system-ui'; ctx.textAlign='center';
    ctx.fillText(cfg.emoji, W/2, 185);

    // Título
    ctx.fillStyle='white'; ctx.font='bold 28px system-ui'; ctx.textAlign='center';
    ctx.fillText(cfg.titulo, W/2, 240);

    // Descripción
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='16px system-ui';
    ctx.fillText(cfg.desc, W/2, 272);

    // Nombre usuario
    if(achievement?.nombre){
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='14px system-ui';
      ctx.fillText(achievement.nombre, W/2, 310);
    }

    // Valor (ej: "30 días")
    if(achievement?.valor){
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 20px system-ui';
      ctx.fillText(achievement.valor, W/2, 345);
    }

    // CTA
    ctx.fillStyle='rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.roundRect(W/2-90, H-50, 180, 28, 14); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='bold 11px system-ui';
    ctx.fillText('Descarga Calorú 🇨🇱 · caloru.cl', W/2, H-31);
    ctx.textAlign='left';

    setReady(true);
  },[]);

  const share = async () => {
    const canvas = canvasRef.current; if(!canvas) return;
    haptic('success');
    canvas.toBlob(async(blob)=>{
      try {
        await navigator.share({files:[new File([blob],'logro-caloru.png',{type:'image/png'})],title:cfg.titulo,text:`${cfg.titulo} en Calorú — Tu nutrición, a tu ritmo 🇨🇱`});
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download='logro-caloru.png'; a.click();
      }
    }, 'image/png');
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',paddingBottom:'env(safe-area-inset-bottom)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:420,background:C.surface,borderRadius:'26px 26px 0 0',padding:'20px 20px 36px',animation:'slideUp .35s ease'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 18px'}}/>
        <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:4,textAlign:'center'}}>🎉 ¡Nuevo logro!</div>
        <div style={{fontSize:12,color:C.textSec,textAlign:'center',marginBottom:16}}>Compártelo con tus amigos</div>
        <div style={{borderRadius:20,overflow:'hidden',marginBottom:16,boxShadow:'0 8px 32px rgba(0,0,0,0.25)'}}>
          <canvas ref={canvasRef} style={{width:'100%',height:'auto',display:'block'}}/>
        </div>
        {ready&&(
          <button onClick={share} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:`linear-gradient(135deg,${cfg.grad[0]},${cfg.grad[1]})`,color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:8}}>
            📤 Compartir logro
          </button>
        )}
        <button onClick={onClose} style={{width:'100%',padding:'13px',borderRadius:18,border:`1px solid ${C.border}`,background:'transparent',color:C.textSec,fontSize:14,cursor:'pointer',fontFamily:F}}>
          Cerrar
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   COMPARTIR PROGRESO — genera imagen canvas
═══════════════════════════════════════════════════════ */
function ShareCard({C, F, nombre, tot, metas, obj, streak, exercises, onClose, xpTotal=0, nivel=null}) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const objLabels={bajar:'Bajando de peso',mantener:'Manteniendo peso',recomp:'Recomposición',subir:'Ganando masa'};
  const localPct = metas.cal>0?Math.min(tot.cal/metas.cal,1):0;
  const burned   = exercises.reduce((s,e)=>s+e.burn,0);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d');
    const W=400,H=480;
    canvas.width=W; canvas.height=H;

    const rr=(x,y,w,h,r)=>{
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
    };

    // Background
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#1A2C22'); bg.addColorStop(1,'#0D1710');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Dot pattern
    ctx.fillStyle='rgba(255,255,255,0.04)';
    for(let x=0;x<W;x+=22) for(let y=0;y<H;y+=22){ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();}

    // App badge
    ctx.fillStyle='rgba(255,255,255,0.08)'; rr(20,18,130,32,16); ctx.fill();
    ctx.fillStyle='white'; ctx.font='bold 13px system-ui'; ctx.fillText('🍽️ Calorú',32,39);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px system-ui'; ctx.textAlign='right';
    ctx.fillText(new Date().toLocaleDateString('es-CL',{day:'numeric',month:'long'}),W-18,39);
    ctx.textAlign='left';

    // Name + obj
    ctx.fillStyle='white'; ctx.font='bold 26px system-ui';
    ctx.fillText('Hoy de '+(nombre.split(' ')[0]||'tú'),20,90);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='13px system-ui';
    ctx.fillText(objLabels[obj]||'',20,112);

    // Big cal
    ctx.fillStyle='#6ECC8A'; ctx.font='bold 64px system-ui';
    ctx.fillText(String(Math.round(tot.cal)),20,192);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='15px system-ui';
    ctx.fillText('kcal consumidas',20,214);

    // Ring
    const cx=W-78,cy=180,r=52;
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=10;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=tot.cal>metas.cal?'#FF3B30':'#34C759';
    ctx.lineCap='round'; ctx.beginPath();
    ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+localPct*Math.PI*2); ctx.stroke();
    ctx.fillStyle='white'; ctx.font='bold 17px system-ui'; ctx.textAlign='center';
    ctx.fillText(Math.round(localPct*100)+'%',cx,cy+5);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='10px system-ui';
    ctx.fillText('de meta',cx,cy+20); ctx.textAlign='left';

    // Macro bars
    const macros=[
      {l:'Proteínas',v:tot.prot,m:metas.prot,c:'#FF6B6B'},
      {l:'Carbohidratos',v:tot.carbs,m:metas.carbs,c:'#FFD93D'},
      {l:'Grasas',v:tot.grasas,m:metas.grasas,c:'#C77DFF'},
    ];
    let my=246;
    macros.forEach(({l,v,m,c})=>{
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px system-ui';
      ctx.fillText(l,20,my);
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 11px system-ui'; ctx.textAlign='right';
      ctx.fillText(Math.round(v)+'/'+(m||0)+'g',W-18,my); ctx.textAlign='left';
      ctx.fillStyle='rgba(255,255,255,0.08)'; rr(20,my+5,W-38,5,3); ctx.fill();
      ctx.fillStyle=c; rr(20,my+5,Math.max(5,Math.round((v/Math.max(m,1))*(W-38))),5,3); ctx.fill();
      my+=34;
    });

    // Streak / exercise
    if(streak.days>0||burned>0){
      ctx.fillStyle='rgba(255,255,255,0.06)'; rr(20,my,W-38,48,12); ctx.fill();
      if(streak.days>0){ctx.fillStyle='white'; ctx.font='bold 12px system-ui'; ctx.fillText('🔥 '+streak.days+' días de racha',30,my+20);}
      if(nivel){ctx.fillStyle='rgba(255,215,0,0.9)'; ctx.font='bold 11px system-ui'; ctx.fillText(nivel.nombre+' · '+xpTotal+' XP',30,my+38);}
      if(burned>0){ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='12px system-ui'; ctx.fillText('💪 '+burned+' kcal quemadas',30,my+38);}
    }

    // Watermark
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='10px system-ui'; ctx.textAlign='center';
    ctx.fillText('Descarga Calorú 🇨🇱',W/2,H-14);
    setReady(true);
  },[]);

  const share=async()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    haptic('success');
    canvas.toBlob(async(blob)=>{
      try{
        await navigator.share({files:[new File([blob],'caloru.png',{type:'image/png'})],title:'Mi progreso en Calorú'});
      }catch{
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='caloru-progreso.png'; a.click();
        URL.revokeObjectURL(url);
      }
    },'image/png');
  };

  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:90,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'26px 26px 0 0',padding:'18px 18px 44px',animation:'slideUp .3s ease'}}>
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 16px'}}/>
        <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:14}}>📤 Compartir progreso</div>
        <div style={{borderRadius:18,overflow:'hidden',marginBottom:14,border:`1px solid ${C.border}`}}>
          <canvas ref={canvasRef} style={{width:'100%',height:'auto',display:'block'}}/>
        </div>
        {ready&&<button className="tap" onClick={share} style={{width:'100%',padding:'15px',borderRadius:18,border:'none',background:'linear-gradient(135deg,#1A2C22,#285C3E)',color:'white',fontSize:15,fontWeight:700,fontFamily:F,cursor:'pointer'}}>
          📤 Compartir imagen
        </button>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   GRÁFICO DE PESO
═══════════════════════════════════════════════════════ */
function WeightChart({data, C, F, obj, metaPeso}) {
  const valid = data.filter(d=>d.w);
  if(valid.length < 2) return (
    <div style={{textAlign:'center',padding:'16px 0',color:C.textMuted,fontSize:12}}>
      Registra tu peso al menos 2 veces para ver la evolución
    </div>
  );
  const vals = valid.map(d=>d.w);
  const lastVal = vals[vals.length-1];
  // Proyección: tendencia lineal
  const n = valid.length;
  const avgChange = n>=2 ? (vals[n-1]-vals[0])/(n-1) : 0; // kg por punto
  const projPoints = 4; // proyectar 4 semanas más
  const projVals = Array.from({length:projPoints},(_,i)=>lastVal+(avgChange*(i+1)));
  const allVals = [...vals, ...projVals];
  const minW = Math.min(...allVals)-0.5, maxW = Math.max(...allVals)+0.5;
  const W=300, H=80;
  const totalPoints = data.length + projPoints;
  const toX = (i) => Math.round((i/(totalPoints-1))*W);
  const toY = w => Math.round(H-((w-minW)/(maxW-minW))*H);
  const pts = data.map((d,i)=>({x:toX(i), y:d.w?toY(d.w):null, ...d}));
  const validPts = pts.filter(p=>p.y!==null);
  const poly = validPts.map(p=>`${p.x},${p.y}`).join(' ');
  const projStartX = toX(data.length-1);
  const projPts = projVals.map((v,i)=>({x:toX(data.length+i), y:toY(v)}));
  const diff = Math.round((vals[vals.length-1]-vals[0])*10)/10;
  const projDiff = Math.round((projVals[projVals.length-1]-lastVal)*10)/10;
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+24}`} style={{overflow:'visible'}}>
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D42020" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#D42020" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wgradproj" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#AF52DE" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#AF52DE" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,0.5,1].map(f=>(
          <line key={f} x1={0} y1={Math.round(H*(1-f))} x2={W} y2={Math.round(H*(1-f))}
            stroke={C.border} strokeWidth={1} strokeDasharray="4 4"/>
        ))}
        {/* Área real */}
        {validPts.length>1&&(
          <polygon
            points={`${validPts[0].x},${H} ${poly} ${validPts[validPts.length-1].x},${H}`}
            fill="url(#wgrad)"/>
        )}
        {/* Área proyección */}
        {projPts.length>0&&(
          <polygon
            points={`${projStartX},${H} ${projStartX},${toY(lastVal)} ${projPts.map(p=>`${p.x},${p.y}`).join(' ')} ${projPts[projPts.length-1].x},${H}`}
            fill="url(#wgradproj)"/>
        )}
        {/* Línea real */}
        {validPts.length>1&&(
          <polyline points={poly} fill="none" stroke="#D42020"
            strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        )}
        {/* Línea proyección */}
        {projPts.length>0&&(
          <polyline
            points={`${projStartX},${toY(lastVal)} ${projPts.map(p=>`${p.x},${p.y}`).join(' ')}`}
            fill="none" stroke="#AF52DE" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4"/>
        )}
        {validPts.map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y}
            r={i===validPts.length-1?5:3}
            fill={i===validPts.length-1?'#D42020':C.surface}
            stroke="#D42020" strokeWidth={2}/>
        ))}
        {/* Punto proyección final */}
        {projPts.length>0&&(
          <circle cx={projPts[projPts.length-1].x} cy={projPts[projPts.length-1].y}
            r={4} fill="none" stroke="#AF52DE" strokeWidth={2} strokeDasharray="3 2"/>
        )}
        <text x={0}  y={H+17} fontSize={9} fill={C.textMuted} fontFamily={F}>{data[0]?.label}</text>
        <text x={W}  y={H+17} fontSize={9} fill={'#AF52DE'} fontFamily={F} textAnchor="end">+4 sem</text>
      </svg>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:6,flexWrap:'wrap',gap:6}}>
        <div style={{fontSize:12,color:C.textSec}}>Inicio: <strong style={{color:C.text}}>{vals[0]} kg</strong></div>
        <div style={{fontSize:13,fontWeight:800,color:diff<0?'#34C759':diff>0?'#FF3B30':C.textSec}}>
          {diff<0?'▼':diff>0?'▲':'='} {Math.abs(diff)} kg
        </div>
        <div style={{fontSize:12,color:C.textSec}}>Hoy: <strong style={{color:C.text}}>{lastVal} kg</strong></div>
      </div>
      {projDiff!==0&&(
        <div style={{marginTop:6,background:'#AF52DE10',borderRadius:10,padding:'7px 10px',display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:12}}>🔮</span>
          <div style={{fontSize:11,color:'#AF52DE',fontWeight:600}}>
            A este ritmo, en 4 semanas: {projDiff>0?'+':''}{projDiff} kg ({(lastVal+projDiff).toFixed(1)} kg)
          </div>
        </div>
      )}
    </div>
  );
}




/* ═══════════════════════════════════════════════════════
   PHOTO STORAGE — IndexedDB (no llena localStorage)
═══════════════════════════════════════════════════════ */
const PhotoDB = {
  _db: null,
  async open() {
    if(this._db) return this._db;
    return new Promise((res,rej)=>{
      const req=indexedDB.open('caloru_photos',1);
      req.onupgradeneeded=e=>e.target.result.createObjectStore('photos',{keyPath:'key'});
      req.onsuccess=e=>{this._db=e.target.result;res(this._db);};
      req.onerror=()=>rej(req.error);
    });
  },
  async save(key,dataUrl){
    try{const db=await this.open();return new Promise(res=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put({key,dataUrl});tx.oncomplete=res;tx.onerror=res;});}catch{}
  },
  async load(key){
    try{const db=await this.open();return new Promise(res=>{const req=db.transaction('photos').objectStore('photos').get(key);req.onsuccess=()=>res(req.result?.dataUrl||'');req.onerror=()=>res('');});}catch{return '';}
  },
  async delete(key){
    try{const db=await this.open();const tx=db.transaction('photos','readwrite');tx.objectStore('photos').delete(key);}catch{}
  },
};

/* ═══════════════════════════════════════════════════════
   SISTEMA DE ALERGIAS
═══════════════════════════════════════════════════════ */
const ALLERGENS = [
  {k:'gluten',      icon:'🌾', label:'Gluten',       color:'#C07C24', desc:'Trigo, cebada, centeno'},
  {k:'lactosa',     icon:'🥛', label:'Lactosa',      color:'#4A86C8', desc:'Leche y derivados'},
  {k:'huevo',       icon:'🥚', label:'Huevo',        color:'#E8A020', desc:'Huevo y ovoproductos'},
  {k:'frutos_secos',icon:'🥜', label:'Frutos secos', color:'#C8784A', desc:'Maní, nueces, almendras'},
  {k:'pescado',     icon:'🐟', label:'Pescado',      color:'#3A8FC8', desc:'Todo tipo de pescado'},
  {k:'mariscos',    icon:'🦐', label:'Mariscos',     color:'#E07B4A', desc:'Crustáceos y moluscos'},
  {k:'soja',        icon:'🫘', label:'Soja',         color:'#5C8A3A', desc:'Soja y derivados'},
  {k:'mostaza',     icon:'🟡', label:'Mostaza',      color:'#D4A830', desc:'Semillas y hojas'},
  {k:'sesamo',      icon:'🌰', label:'Sésamo',       color:'#A07030', desc:'Tahini, aceite de sésamo'},
  {k:'sulfitos',    icon:'🍷', label:'Sulfitos',     color:'#8B4A8B', desc:'Vinos, conservas'},
  {k:'apio',        icon:'🥬', label:'Apio',         color:'#4A8A4A', desc:'Apio y especias'},
  {k:'altramuces',  icon:'🌸', label:'Altramuces',   color:'#D47A8A', desc:'Harina de altramuces'},
  {k:'moluscos',    icon:'🦪', label:'Moluscos',     color:'#5A7A9A', desc:'Almejas, mejillones'},
];

/* Mapa de productos a sus alérgenos */
const ALLERGEN_MAP = {
  /* Lactosa */
  1:'lactosa',2:'lactosa',3:'lactosa',4:'lactosa',5:'lactosa',6:'lactosa',7:'lactosa',
  8:'lactosa',9:'lactosa',10:'lactosa',11:'lactosa',12:'lactosa',13:'lactosa',14:'lactosa',
  15:'lactosa',16:'lactosa',17:'lactosa',18:'lactosa',19:'lactosa',20:'lactosa',
  /* Gluten: panes, pastas, galletas */
  60:'gluten',61:'gluten',62:'gluten',63:'gluten',64:'gluten',65:'gluten',
  70:'gluten',71:'gluten',72:'gluten',73:'gluten',74:'gluten',75:'gluten',
  80:'gluten',81:'gluten',82:'gluten',83:'gluten',84:'gluten',
  /* Huevo */
  200:'huevo',201:'huevo',202:'huevo',203:'huevo',
  /* Pescado */
  220:'pescado',221:'pescado',222:'pescado',223:'pescado',224:'pescado',225:'pescado',
  /* Mariscos */
  226:'mariscos',227:'mariscos',228:'mariscos',
  /* Frutos secos */
  130:'frutos_secos',131:'frutos_secos',132:'frutos_secos',133:'frutos_secos',
};

/* Productos con múltiples alérgenos */
const MULTI_ALLERGENS = {
  /* Empanadas: gluten + huevo */
  170:['gluten','huevo'], 171:['gluten','huevo'], 172:['gluten','huevo'],
  /* Kuchen: gluten + lactosa + huevo */
  100:['gluten','lactosa','huevo'],
};

/* Mapeo de tags de OpenFoodFacts → claves internas */
const OFF_ALLERGEN_MAP = {
  'en:gluten':                  'gluten',
  'en:wheat':                   'gluten',
  'en:rye':                     'gluten',
  'en:barley':                  'gluten',
  'en:oats':                    'gluten',
  'en:milk':                    'lactosa',
  'en:lactose':                 'lactosa',
  'en:eggs':                    'huevo',
  'en:egg':                     'huevo',
  'en:nuts':                    'frutos_secos',
  'en:peanuts':                 'frutos_secos',
  'en:almonds':                 'frutos_secos',
  'en:walnuts':                 'frutos_secos',
  'en:hazelnuts':               'frutos_secos',
  'en:cashews':                 'frutos_secos',
  'en:pistachios':              'frutos_secos',
  'en:fish':                    'pescado',
  'en:crustaceans':             'mariscos',
  'en:crustacean':              'mariscos',
  'en:soybeans':                'soja',
  'en:soy':                     'soja',
  'en:mustard':                 'mostaza',
  'en:sesame-seeds':            'sesamo',
  'en:sesame':                  'sesamo',
  'en:sulphur-dioxide-and-sulphites': 'sulfitos',
  'en:sulphites':               'sulfitos',
  'en:sulfites':                'sulfitos',
  'en:celery':                  'apio',
  'en:lupin':                   'altramuces',
  'en:molluscs':                'moluscos',
  'en:mollusks':                'moluscos',
};

/* Detección por ingredientes — fallback si OpenFoodFacts no trae allergens_tags */
const ALLERGEN_INGR_KEYWORDS = {
  gluten:       ['trigo','harina de trigo','gluten','cebada','centeno','avena','wheat','barley','rye','spelt','kamut'],
  lactosa:      ['leche','crema','mantequilla','queso','yogur','nata','suero de leche','caseína','lactosa','lactosuero','milk','cream','butter','cheese','yogurt','whey','casein','lactose'],
  huevo:        ['huevo','yema de huevo','clara de huevo','egg','eggs','egg white','egg yolk'],
  frutos_secos: ['maní','nueces','almendras','avellanas','anacardos','pistachos','nuez de macadamia','peanut','nuts','almonds','walnuts','hazelnuts','cashew','pistachio','macadamia'],
  pescado:      ['pescado','salmón','atún','merluza','anchoa','bacalao','fish','tuna','salmon','cod','anchovy','tilapia'],
  mariscos:     ['camarón','langosta','cangrejo','centolla','jaiba','crustáceo','shrimp','lobster','crab','prawn','crayfish'],
  soja:         ['soja','soya','lecitina de soja','proteína de soja','soy','soybean','soya lecithin','tofu'],
  mostaza:      ['mostaza','mustard'],
  sesamo:       ['sésamo','ajonjolí','tahini','sesame','sesame seeds'],
  sulfitos:     ['sulfito','sulfuroso','dióxido de azufre','sulphite','sulfite','sulphur dioxide','so2'],
  apio:         ['apio','celery'],
  altramuces:   ['altramuz','lupino','harina de lupino','lupin','lupine'],
  moluscos:     ['almeja','mejillón','ostión','calamar','pulpo','ostra','clam','mussel','oyster','squid','octopus'],
};

const detectAllergensFromIngredients = (ingredientsText) => {
  if(!ingredientsText) return [];
  const txt = ingredientsText.toLowerCase();
  return Object.entries(ALLERGEN_INGR_KEYWORDS)
    .filter(([, kws]) => kws.some(kw => txt.includes(kw)))
    .map(([key]) => key);
};

const getFoodAllergens = (foodOrId) => {
  // Acepta objeto food completo o solo el id
  const food = (foodOrId && typeof foodOrId === 'object') ? foodOrId : null;
  const id   = food ? food.id : foodOrId;

  // 1. Producto escaneado: usar alérgenos detectados desde OpenFoodFacts
  if(food?.detectedAllergens?.length > 0) return food.detectedAllergens;

  // 2. Fallback: detección por ingredientes (escaneados sin allergens_tags)
  if(food?.ingredients) {
    const detected = detectAllergensFromIngredients(food.ingredients);
    if(detected.length > 0) return detected;
  }

  // 3. Mapa estático para productos de la DB
  if(MULTI_ALLERGENS[id]) return MULTI_ALLERGENS[id];
  if(ALLERGEN_MAP[id]) return [ALLERGEN_MAP[id]];
  return [];
};

/* ═══════════════════════════════════════════════════════
   SISTEMA VEGANO
═══════════════════════════════════════════════════════ */
// Categorías 100% no-veganas (origen animal)
const NON_VEGAN_CATS = new Set(['Carnes','Cecinas','Huevos','Pescados']);
// Categorías 100% veganas
const VEGAN_CATS = new Set(['Frutas','Verduras','Legumbres','Granos','Aceites']);

// Excepciones veganas dentro de categorías no-veganas (ej: leches vegetales en Lácteos)
const VEGAN_OVERRIDES = new Set([
  7,8,9,10,        // Leche avena/almendra/soja/coco
  321,323,324,     // Proteína vegana guisante, creatina, BCAA
  499,500,         // Leche avena y almendras (en Bebidas)
]);

// IDs explícitamente no-veganos en categorías mixtas
const NON_VEGAN_IDS = new Set([
  // Lácteos animales (toda la cat salvo overrides — se maneja por cat)
  // Panes con lácteos, huevo o manteca animal
  81,  // Hallulla — manteca de cerdo (artesanal)
  82,  // Pan molde Harry's blanco — suero de leche
  83,  // Pan molde Harry's integral — suero de leche
  84,  // Pan molde Bimbo blanco — suero de leche + leche descremada
  85,  // Pan molde Bimbo integral — suero de leche
  86,  // Pan Schär sin gluten — huevo en polvo
  87,  // Pan pita Ideal — leche en polvo
  90,  // Sopaipilla — manteca animal
  // Cereales: granola con miel
  103,
  // Snacks con lácteos/huevos/gelatina/carne
  120,121,122,123,127,129,130,137,139,
  352,353,354,460,462,464,465,466,
  // Bebidas con lácteos
  169,361,362,450,451,
  // Condimentos no-veganos
  311,312,371,374,481,
  // Preparados con carne/huevo/lácteos
  380,381,382,383,384,385,386,388,
  // Congelados no-veganos
  300,302,303,304,305,
  // Comida rápida no-vegana
  330,331,332,334,335,336,337,338,
  // Comidas CL no-veganas
  280,281,282,283,284,285,286,287,289,290,291,292,293,294,295,
  430,431,432,433,434,435,436,441,442,443,452,
  // Suplementos no-veganos (whey, colágeno)
  320,322,325,503,504,
]);

// IDs veganos dentro de categorías mixtas
const VEGAN_IDS = new Set([
  // Panes veganos reales (harina/agua/levadura/sal — sin lácteos ni huevos)
  80,  // Marraqueta
  88,  // Ciabatta
  89,  // Baguette
  91,  // Tostadas de agua Luchetti
  92,  // Galletas de arroz
  93,  // Pan de centeno
  // Cereales veganos
  100,101,102,104,105,106,107,108,109,110,
  // Snacks veganos
  124,125,126,128,131,132,133,134,135,136,138,140,
  350,351,355,356,461,463,483,
  // Bebidas veganas
  150,151,152,153,154,155,156,157,158,159,
  160,161,162,163,164,165,166,167,168,170,171,172,173,
  360,363,364,365,366,438,439,485,486,487,
  // Condimentos veganos
  310,313,314,315,316,317,318,370,372,373,406,416,444,445,482,
  // Preparados veganos
  387,389,
  // Congelados veganos
  301,306,307,
  // Comida rápida vegana
  333,
  // Comidas CL veganas
  288,437,
  // Suplementos veganos
  321,323,324,
]);

// Heurística por nombre para productos escaneados/personalizados sin ID en DB
const NON_VEGAN_NAME_KEYWORDS = [
  // Español
  'pollo','vacuno','cerdo','carne','pavo','cordero','salmón','atún','merluza',
  'reineta','congrio','corvina','trucha','mariscos','camarón','centolla','jaiba',
  'cholga','almeja','ostión','pulpo','calamar','pescado','atun','anchoa',
  'leche entera','leche semidesc','leche descrem','leche con chocolate',
  'queso','yogurt','yogur','mantequilla','crema de leche','manjar','requesón',
  'ricotta','kéfir','lactosuero','suero de leche',
  'jamón','mortadela','salame','chorizo','longaniza','vienesa','tocino','paté',
  'arrollado','prieta','chicharrón','pepperoni',
  'huevo','mayonesa','miel de abeja','gelatina','colágeno','whey',
  'caldo de pollo','caldo de carne','caldo de vacuno',
  // Inglés (frecuente en productos importados escaneados)
  'milk','whole milk','skim milk','butter','cream','cheese','yogurt',
  'whey','casein','lactose','egg','eggs','egg white','egg yolk',
  'chicken','beef','pork','turkey','lamb','fish','tuna','salmon','shrimp',
  'prawn','anchovy','gelatin','honey','lard','collagen',
  'meat','bacon','ham','salami','pepperoni',
];

const isVegan = (food) => {
  // 0. Escaneados/custom con campo explícito desde OpenFoodFacts
  if(food.vegan === true)  return true;
  if(food.vegan === false) return false;
  const id = food.id;
  // 1. Override explícito vegano
  if(VEGAN_OVERRIDES.has(id) || VEGAN_IDS.has(id)) return true;
  // 2. Override explícito no-vegano
  if(NON_VEGAN_IDS.has(id)) return false;
  // 3. Categorías enteras no-veganas
  if(NON_VEGAN_CATS.has(food.cat)) return false;
  // 4. Toda la categoría Lácteos es no-vegana (salvo overrides ya revisados)
  if(food.cat === 'Lácteos') return false;
  // 5. Categorías enteras veganas
  if(VEGAN_CATS.has(food.cat)) return true;
  // 6. Para productos sin ID en DB (escaneados/custom): heurística por nombre + ingredientes
  if(!id || id > 9000) {
    const n = (food.nombre||'').toLowerCase();
    const ingr = (food.ingredients||'').toLowerCase();
    const haystack = n + ' ' + ingr;
    return !NON_VEGAN_NAME_KEYWORDS.some(kw => haystack.includes(kw));
  }
  // 7. Default: se asume vegano si no hay evidencia de lo contrario
  return true;
};

/* ═══════════════════════════════════════════════════════
   EQUIVALENCIAS DE PORCIÓN
═══════════════════════════════════════════════════════ */
const PORTION_REFS = [
  {g:5,   l:'1 cdita.'},
  {g:15,  l:'1 cda.'},
  {g:20,  l:'1 cda. colmada'},
  {g:30,  l:'2 cdas. / 1 oz'},
  {g:45,  l:'3 cdas.'},
  {g:60,  l:'¼ taza'},
  {g:80,  l:'⅓ taza'},
  {g:120, l:'½ taza'},
  {g:180, l:'¾ taza'},
  {g:200, l:'1 vaso'},
  {g:240, l:'1 taza'},
  {g:480, l:'2 tazas'},
];

const getPortionHint = (grams) => {
  if(!grams || grams<=0) return null;
  const best = PORTION_REFS.reduce((p,n) =>
    Math.abs(n.g-grams) < Math.abs(p.g-grams) ? n : p
  );
  return Math.abs(best.g-grams) <= grams*0.2 ? best.l : null;
};

const getPortionHints = (grams) => {
  if(!grams || grams<=0) return [];
  return PORTION_REFS
    .filter(r => Math.abs(r.g-grams) <= grams*0.35)
    .sort((a,b) => Math.abs(a.g-grams)-Math.abs(b.g-grams))
    .slice(0,2);
};


/* ═══════════════════════════════════════════════════════
   EDGE FUNCTION URL — tu proxy de Supabase para Claude API
   Cambia esta URL cuando hagas deploy de la edge function.
═══════════════════════════════════════════════════════ */
const EDGE_FN_URL = 'https://fywghvfdwltayylswnid.supabase.co/functions/v1/analyze-food';

/* Helper: llamar a la edge function */
const callEdgeFn = async (body, signal) => {
  const ctrl = signal ? null : new AbortController();
  const tid  = ctrl ? setTimeout(() => ctrl.abort(), 30000) : null;
  try {
    // Siempre enviar JWT para que la Edge Function pueda verificar autenticación
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: signal || ctrl?.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}`);
    }
    return res.json();
  } finally {
    if (tid) clearTimeout(tid);
  }
};


/* ═══════════════════════════════════════════════════════
   FOOD PHOTO SCANNER — analiza foto de comida con IA
═══════════════════════════════════════════════════════ */
function FoodPhotoScanner({C, F, nombre, meal, onAdd, onClose, userAllergens=[], veganMode=false}) {
  const dark = C.surface !== '#FFFFFF' && C.surface !== '#ffffff'; // derive from theme
  const [status, setStatus]         = useState('idle');  // idle | capturing | analyzing | results | error
  const [image, setImage]           = useState(null);    // base64 string
  const [preview, setPreview]       = useState(null);    // object URL for display
  const [result, setResult]         = useState(null);    // parsed analysis
  const [error, setError]           = useState('');
  const [selected, setSelected]     = useState({});      // {index: true}
  const [editingIdx, setEditingIdx] = useState(null);    // índice del alimento en edición
  const [editedFoods, setEditedFoods] = useState([]);   // copia editable de alimentos
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  /* ── Capturar foto desde cámara o galería ── */
  const handleCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('analyzing');
    setError('');

    try {
      // Leer como base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
      });

      // Crear preview
      const url = URL.createObjectURL(file);
      setPreview(url);

      // Comprimir si es muy grande (>2MB)
      let finalBase64 = base64;
      if (file.size > 2 * 1024 * 1024) {
        finalBase64 = await compressImage(base64, 1200, 0.8);
      }

      setImage(finalBase64);

      // Enviar a la edge function
      const data = await callEdgeFn({
        mode: 'photo',
        image: finalBase64,
        nombre,
        userAllergens,
        veganMode,
      });

      if (data.result?.error) {
        setError(data.result.error);
        setStatus('error');
        return;
      }

      if (data.result?.alimentos?.length) {
        setResult(data.result);
        // Seleccionar todos por defecto
        const sel = {};
        data.result.alimentos.forEach((_, i) => sel[i] = true);
        setSelected(sel);
        setEditedFoods([...data.result.alimentos]);
        setStatus('results');
      } else {
        setError('No se identificaron alimentos en la imagen. Intenta con una foto más clara.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Photo analysis error:', err);
      setError(err.message || 'Error al analizar la imagen');
      setStatus('error');
    }
  };

  /* ── Comprimir imagen ── */
  const compressImage = (base64, maxDim, quality) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width: w, height: h } = img;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });

  /* ── Edición inline de un alimento ── */
  const updateFoodField = (idx, field, val) => {
    setEditedFoods(prev => prev.map((f, i) => i !== idx ? f : { ...f, [field]: val }));
  };
  const updateFoodPorcion = (idx, newG) => {
    const orig = result?.alimentos?.[idx];
    if (!orig || !newG) return;
    const ratio = Math.max(0.01, newG) / Math.max(1, orig.porcion_g || 100);
    setEditedFoods(prev => prev.map((f, i) => i !== idx ? f : {
      ...f, porcion_g: newG,
      cal:    Math.round((orig.cal   || 0) * ratio),
      prot:   Math.round((orig.prot  || 0) * ratio * 10) / 10,
      carbs:  Math.round((orig.carbs || 0) * ratio * 10) / 10,
      grasas: Math.round((orig.grasas|| 0) * ratio * 10) / 10,
      fibra:  Math.round((orig.fibra || 0) * ratio * 10) / 10,
    }));
  };

  /* ── Agregar alimentos seleccionados al log ── */
  const addSelected = () => {
    const foods = editedFoods.length ? editedFoods : result?.alimentos;
    if (!foods) return;
    foods.forEach((food, i) => {
      if (!selected[i]) return;
      onAdd({
        id: Date.now() + Math.random() + i,
        nombre: food.nombre,
        marca: 'Foto IA',
        cat: 'Escaneado',
        porcion: food.porcion_g || 100,
        cal: food.cal || 0,
        prot: food.prot || 0,
        carbs: food.carbs || 0,
        grasas: food.grasas || 0,
        fibra: food.fibra || 0,
        azucar: 0,
        sodio: 0,
        emoji: food.emoji || '📸',
        grams: food.porcion_g || 100,
        origen: 'foto_ia',
      });
    });
    onClose();
  };

  const toggleItem = (i) => { if (editingIdx !== i) setSelected(prev => ({ ...prev, [i]: !prev[i] })); };
  const activeFoods = editedFoods.length ? editedFoods : (result?.alimentos || []);
  const totalSelected = activeFoods.reduce((t, f, i) => selected[i] ? t + (f.cal || 0) : t, 0);

  /* ── Confidencia visual ── */
  const confColor = {alta:'#34C759', media:'#FF9500', baja:'#FF3B30'};
  const confLabel = {alta:'Alta confianza', media:'Confianza media', baja:'Baja confianza'};

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
      zIndex:75, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxHeight:'92vh', background:C.surface,
        borderRadius:'26px 26px 0 0', padding:'16px 16px 40px',
        animation:'slideUp .3s ease', overflowY:'auto',
      }}>
        {/* Handle */}
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:'0 auto 14px'}}/>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:C.text,letterSpacing:'-.3px'}}>
              📸 Escanear tu plato
            </div>
            <div style={{fontSize:11,color:C.textSec,marginTop:2}}>
              La IA analiza tu comida y estima las calorías
            </div>
          </div>
          <div style={{
            fontSize:9, fontWeight:700, color:'#D42020',
            background:'#D4202014', padding:'3px 9px',
            borderRadius:8, border:'1px solid #D4202040',
          }}>BETA</div>
        </div>

        {/* ── ESTADO: IDLE — botones de captura ── */}
        {status === 'idle' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div style={{
              background:`linear-gradient(135deg, ${C.surfaceAlt}, ${dark ? '#1a1a2e' : '#f0f4ff'})`,
              borderRadius:20, padding:'28px 20px', textAlign:'center',
              border:`1.5px dashed ${C.border}`, marginBottom:14,
            }}>
              <div style={{fontSize:56, marginBottom:12}}>🍽️</div>
              <div style={{fontSize:14, fontWeight:700, color:C.text, marginBottom:6}}>
                Saca una foto de tu plato
              </div>
              <div style={{fontSize:12, color:C.textSec, lineHeight:1.5, maxWidth:260, margin:'0 auto 18px'}}>
                Puede ser tu almuerzo, once, snack o lo que sea. La IA identificará cada alimento y estimará las calorías.
              </div>

              <div style={{display:'flex', gap:10, justifyContent:'center'}}>
                <button className="tap" onClick={() => {
                  inputRef.current.setAttribute('capture', 'environment');
                  inputRef.current.click();
                }} style={{
                  padding:'13px 22px', borderRadius:16, border:'none',
                  background:'#D42020', color:'white',
                  fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:F,
                  display:'flex', alignItems:'center', gap:7,
                }}>
                  <span style={{fontSize:18}}>📷</span> Cámara
                </button>
                <button className="tap" onClick={() => {
                  inputRef.current.removeAttribute('capture');
                  inputRef.current.click();
                }} style={{
                  padding:'13px 22px', borderRadius:16,
                  border:`1.5px solid ${C.border}`, background:C.surfaceAlt,
                  color:C.text, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:F,
                  display:'flex', alignItems:'center', gap:7,
                }}>
                  <span style={{fontSize:18}}>🖼️</span> Galería
                </button>
              </div>
            </div>

            <div style={{
              background:C.surfaceAlt, borderRadius:14, padding:'10px 14px',
              border:`1px solid ${C.border}`,
            }}>
              <div style={{fontSize:11, fontWeight:700, color:C.textSec, marginBottom:6}}>💡 Tips para mejor precisión</div>
              {['Foto clara, bien iluminada, sin flash directo',
                'Incluye todo el plato en el encuadre',
                'Mientras más se distinguen los alimentos, mejor',
              ].map(tip => (
                <div key={tip} style={{fontSize:11, color:C.textSec, padding:'3px 0', display:'flex', gap:6}}>
                  <span>•</span><span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ESTADO: ANALYZING ── */}
        {status === 'analyzing' && (
          <div style={{textAlign:'center', padding:'24px 0', animation:'fadeUp .3s ease'}}>
            {preview && (
              <div style={{
                width:180, height:180, borderRadius:24, overflow:'hidden',
                margin:'0 auto 18px', border:`3px solid ${C.border}`,
                position:'relative',
              }}>
                <img src={preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                <div style={{
                  position:'absolute', inset:0,
                  background:'rgba(0,0,0,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{
                    width:48, height:48, borderRadius:'50%',
                    border:'3px solid rgba(255,255,255,0.8)',
                    borderTopColor:'transparent',
                    animation:'spin 1s linear infinite',
                  }}/>
                </div>
              </div>
            )}
            <div style={{fontSize:16, fontWeight:700, color:C.text, marginBottom:6}}>
              Analizando tu plato...
            </div>
            <div style={{fontSize:12, color:C.textSec, lineHeight:1.5}}>
              Identificando alimentos y calculando macros
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── ESTADO: RESULTS ── */}
        {status === 'results' && result && (
          <div style={{animation:'fadeUp .3s ease'}}>
            {/* Preview + resumen */}
            <div style={{display:'flex', gap:12, marginBottom:14}}>
              {preview && (
                <div style={{
                  width:80, height:80, borderRadius:16, overflow:'hidden',
                  flexShrink:0, border:`2px solid ${C.border}`,
                }}>
                  <img src={preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
              )}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15, fontWeight:800, color:C.text, lineHeight:1.3}}>
                  {result.plato || 'Plato analizado'}
                </div>
                {result.confianza && (
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:4, marginTop:5,
                    fontSize:10, fontWeight:700, color:confColor[result.confianza] || C.textSec,
                    background:(confColor[result.confianza] || C.textSec)+'18',
                    padding:'3px 8px', borderRadius:8,
                  }}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:confColor[result.confianza]}}/>
                    {confLabel[result.confianza] || result.confianza}
                  </div>
                )}
                {result.total && (
                  <div style={{
                    fontSize:13, fontWeight:800, color:'#D42020', marginTop:6,
                  }}>
                    Total: ~{result.total.cal} kcal
                  </div>
                )}
              </div>
            </div>

            {/* Macro totales */}
            {result.total && (
              <div style={{
                display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:7,
                marginBottom:14,
              }}>
                {[
                  {l:'Proteína',v:`${result.total.prot}g`,c:C.red},
                  {l:'Carbos',v:`${result.total.carbs}g`,c:C.amber},
                  {l:'Grasas',v:`${result.total.grasas}g`,c:C.purple},
                  {l:'Fibra',v:`${result.total.fibra||0}g`,c:C.green},
                ].map(({l,v,c}) => (
                  <div key={l} style={{
                    background:C.surfaceAlt, borderRadius:12, padding:'9px 6px',
                    textAlign:'center', border:`1px solid ${C.border}`,
                  }}>
                    <div style={{fontSize:14,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                    <div style={{fontSize:9,color:C.textMuted,fontWeight:600,marginTop:3}}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de alimentos — seleccionables y editables */}
            <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
              Alimentos detectados · toca para seleccionar · ✏️ para editar
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
              {activeFoods.map((food, i) => (
                <div key={i} style={{
                  background:selected[i] ? C.surfaceAlt : C.surface,
                  borderRadius:14,
                  border:`1.5px solid ${editingIdx===i ? '#007AFF' : selected[i] ? '#D42020' : C.border}`,
                  overflow:'hidden', transition:'all .2s',
                }}>
                  {/* Fila principal — tap = toggle selección */}
                  <div onClick={() => toggleItem(i)} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', cursor:'pointer',
                  }}>
                    <div style={{
                      width:24, height:24, borderRadius:8, flexShrink:0,
                      background:selected[i] ? '#D42020' : 'transparent',
                      border:selected[i] ? 'none' : `2px solid ${C.border}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'white', fontSize:14, fontWeight:700, transition:'all .2s',
                    }}>
                      {selected[i] && '✓'}
                    </div>
                    <div style={{fontSize:24, flexShrink:0}}>{food.emoji || '🍽️'}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.3}}>{food.nombre}</div>
                      <div style={{fontSize:11,color:C.textSec,marginTop:2}}>
                        ~{food.porcion_g}g · P:{food.prot}g · C:{food.carbs}g · G:{food.grasas}g
                      </div>
                    </div>
                    <div style={{flexShrink:0,display:'flex',alignItems:'center',gap:6}}>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:14,fontWeight:800,color:'#D42020'}}>{food.cal}</div>
                        <div style={{fontSize:9,color:C.textMuted}}>kcal</div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setEditingIdx(editingIdx===i?null:i);}} style={{
                        width:28,height:28,borderRadius:8,border:`1px solid ${editingIdx===i?'#007AFF':C.border}`,
                        background:editingIdx===i?'#007AFF':C.surfaceAlt,
                        color:editingIdx===i?'white':C.textSec,
                        fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                      }}>✏️</button>
                    </div>
                  </div>
                  {/* Panel edición inline */}
                  {editingIdx === i && (
                    <div onClick={e=>e.stopPropagation()} style={{
                      padding:'12px',borderTop:`1px solid ${C.border}`,
                      background:dark?'rgba(0,122,255,0.07)':'rgba(0,122,255,0.04)',
                    }}>
                      <div style={{fontSize:10,fontWeight:700,color:'#007AFF',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>
                        ✏️ Editar alimento
                      </div>
                      {/* Nombre */}
                      <input
                        value={food.nombre}
                        onChange={e=>updateFoodField(i,'nombre',e.target.value)}
                        placeholder="Nombre del alimento"
                        style={{width:'100%',boxSizing:'border-box',padding:'8px 10px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontSize:12,fontFamily:F,marginBottom:8,outline:'none'}}
                      />
                      {/* Porción → escala macros automáticamente */}
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                        <div style={{fontSize:11,color:C.textSec,fontWeight:600,whiteSpace:'nowrap',flexShrink:0}}>⚖️ Porción</div>
                        <input
                          type="number" min="1" max="2000"
                          value={food.porcion_g}
                          onChange={e=>updateFoodPorcion(i,Number(e.target.value)||1)}
                          style={{flex:1,padding:'7px 10px',borderRadius:10,border:'1.5px solid #007AFF',background:C.surface,color:C.text,fontSize:13,fontWeight:700,fontFamily:F,textAlign:'center',outline:'none'}}
                        />
                        <div style={{fontSize:10,color:'#007AFF',whiteSpace:'nowrap',flexShrink:0}}>g → escala macros</div>
                      </div>
                      {/* Macros editables manualmente */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:8}}>
                        {[
                          {field:'cal',   label:'Kcal',    color:'#D42020'},
                          {field:'prot',  label:'Prot g',  color:'#FF6B6B'},
                          {field:'carbs', label:'Carbs g', color:'#FF9500'},
                          {field:'grasas',label:'Grasas g',color:'#AF52DE'},
                        ].map(({field,label,color})=>(
                          <div key={field} style={{textAlign:'center'}}>
                            <div style={{fontSize:9,fontWeight:700,color,marginBottom:3}}>{label}</div>
                            <input
                              type="number" min="0"
                              value={food[field]}
                              onChange={e=>updateFoodField(i,field,Number(e.target.value)||0)}
                              style={{width:'100%',padding:'5px 2px',borderRadius:8,border:`1px solid ${color}40`,background:C.surface,color:C.text,fontSize:12,fontWeight:700,fontFamily:F,textAlign:'center',outline:'none'}}
                            />
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>setEditingIdx(null)} style={{
                        width:'100%',padding:'9px',borderRadius:10,border:'none',
                        background:'#007AFF',color:'white',fontSize:12,fontWeight:700,
                        cursor:'pointer',fontFamily:F,
                      }}>✓ Listo</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Consejo IA */}
            {result.consejo && (
              <div style={{
                background:dark?'rgba(0,122,255,0.08)':'rgba(0,122,255,0.06)',
                borderRadius:13, padding:'10px 13px', marginBottom:14,
                borderLeft:'3px solid #D42020',
              }}>
                <div style={{fontSize:12,color:C.text,lineHeight:1.5,fontWeight:500}}>
                  💡 {result.consejo}
                </div>
              </div>
            )}

            {/* Advertencia alergias/vegano */}
            {(userAllergens.length>0||veganMode)&&result?.alimentos&&(()=>{
              const nombresPlato = result.alimentos.map(a=>a.nombre.toLowerCase()).join(' ');
              const ALERGEN_KEYWORDS = {gluten:['trigo','harina','pan','pasta','gluten','cebada','centeno'],lactosa:['leche','queso','mantequilla','crema','yogurt','lácteo'],huevo:['huevo','mayonesa'],mariscos:['camarón','marisco','langosta','cangrejo','mejillón'],nueces:['nuez','almendra','maní','cacahuete','avellana'],soja:['soja','tofu','soya'],maní:['maní','cacahuete']};
              const alertas = [];
              userAllergens.forEach(al=>{
                const kws = ALERGEN_KEYWORDS[al]||[al.toLowerCase()];
                if(kws.some(k=>nombresPlato.includes(k))) alertas.push(`⚠️ Puede contener ${al}`);
              });
              if(veganMode){
                const noVegan=['carne','pollo','cerdo','vacuno','pescado','atún','salmón','huevo','leche','queso','mantequilla','yogurt','miel','jamón','tocino'];
                if(noVegan.some(k=>nombresPlato.includes(k))) alertas.push('🌱 Este plato puede no ser apto para veganos');
              }
              if(!alertas.length) return null;
              return (
                <div style={{background:'rgba(255,59,48,0.08)',borderRadius:14,padding:'12px 14px',marginBottom:14,border:'1px solid rgba(255,59,48,0.3)'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#FF3B30',marginBottom:6}}>⚠️ Alertas de tu perfil</div>
                  {alertas.map((a,i)=><div key={i} style={{fontSize:12,color:'#FF3B30',marginBottom:2}}>{a}</div>)}
                </div>
              );
            })()}

            {/* Disclaimer */}
            <div style={{
              fontSize:10, color:C.textMuted, textAlign:'center',
              marginBottom:14, lineHeight:1.5,
            }}>
              ⚠️ Los valores son estimados por IA y pueden variar.
              Ajusta las porciones manualmente si es necesario.
            </div>

            {/* Botones de acción */}
            <div style={{display:'flex',gap:8}}>
              <button className="tap" onClick={() => {
                setStatus('idle'); setResult(null); setPreview(null); setImage(null);
              }} style={{
                flex:1, padding:'14px', borderRadius:16,
                border:`1.5px solid ${C.border}`, background:C.surfaceAlt,
                color:C.textSec, fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:F,
              }}>
                📷 Otra foto
              </button>
              <button className="tap" onClick={addSelected} disabled={totalSelected===0} style={{
                flex:2, padding:'14px', borderRadius:16, border:'none',
                background:totalSelected > 0 ? '#D42020' : '#C7C7CC',
                color:'white', fontSize:14, fontWeight:700,
                cursor:totalSelected > 0 ? 'pointer' : 'default', fontFamily:F,
              }}>
                {totalSelected > 0
                  ? `Agregar ${Object.values(selected).filter(Boolean).length} items · ~${totalSelected} kcal`
                  : 'Selecciona alimentos'
                }
              </button>
            </div>
          </div>
        )}

        {/* ── ESTADO: ERROR ── */}
        {status === 'error' && (
          <div style={{textAlign:'center', padding:'20px 0', animation:'fadeUp .25s ease'}}>
            {preview && (
              <div style={{
                width:120, height:120, borderRadius:20, overflow:'hidden',
                margin:'0 auto 14px', border:`2px solid ${C.border}`, opacity:0.6,
              }}>
                <img src={preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            )}
            <div style={{fontSize:36,marginBottom:8}}>😕</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>
              No se pudo analizar
            </div>
            <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:16,maxWidth:260,margin:'0 auto 16px'}}>
              {error}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button className="tap" onClick={() => {
                setStatus('idle'); setError(''); setPreview(null);
              }} style={{
                padding:'12px 20px', borderRadius:16,
                border:`1px solid ${C.border}`, background:C.surfaceAlt,
                color:C.text, fontSize:13, fontWeight:600,
                cursor:'pointer', fontFamily:F,
              }}>
                📷 Intentar de nuevo
              </button>
            </div>
          </div>
        )}

        {/* Input file oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleCapture}
          style={{display:'none'}}
        />
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   ASISTENTE IA NUTRICIONAL — powered by Claude (via Edge Function)
═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   PANEL PROFESIONAL — nutricionista
═══════════════════════════════════════════════════════ */
function PanelProfesional({C, F, dark, nombre, supabaseUser, onSwitchPersonal}) {
  const [pacientes, setPacientes] = React.useState([]);
  const [loading, setLoading]     = React.useState(false);
  const [showNuevoPlan, setShowNuevoPlan] = React.useState(false);
  const [selectedPaciente, setSelectedPaciente] = React.useState(null);
  const [codigoPro, setCodigoPro] = React.useState(()=>LS.get('professional_code',''));
  const [copiado, setCopiado] = React.useState(false);
  const [editPlan, setEditPlan] = React.useState(null);

  // Verificación server-side de suscripción al montar (segunda capa de seguridad)
  React.useEffect(()=>{
    if(!supabaseUser) return;
    supabase.from('profiles')
      .select('subscription_status')
      .eq('id', supabaseUser.id)
      .single()
      .then(({data})=>{
        if(data?.subscription_status !== 'nutricionista') {
          // La suscripción no es válida — redirigir al modo personal
          onSwitchPersonal();
        }
      });
  },[supabaseUser?.id]);

  React.useEffect(()=>{
    if(!supabaseUser) return;
    (async()=>{
      const {data:existing} = await supabase.from('nutricionista_codes')
        .select('code').eq('nutricionista_id', supabaseUser.id).maybeSingle();
      if(existing?.code) {
        setCodigoPro(existing.code);
        LS.set('professional_code', existing.code);
      } else {
        // Si ya teníamos un código en caché (que pudo no haberse guardado antes
        // por falta de permisos), persistir ESE mismo para no cambiarlo. Si no,
        // generar uno nuevo criptográficamente seguro.
        const cached = LS.get('professional_code','');
        let codeToSave = /^NUT-[A-Z0-9]{4,}$/.test(cached) ? cached : '';
        if(!codeToSave){
          const arr = new Uint8Array(4);
          crypto.getRandomValues(arr);
          // Evitar caracteres ambiguos en el código (O/I/L) para que no se
          // confundan con 0/1 al copiarlo.
          codeToSave = 'NUT-'+Array.from(arr).map(b=>b.toString(36).padStart(2,'0')).join('').toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1').slice(0,6);
        }
        const nombreSeguro = nombre?.trim() || supabaseUser.email?.split('@')[0] || 'Nutricionista';
        await supabase.from('nutricionista_codes').upsert(
          {nutricionista_id:supabaseUser.id, code:codeToSave, nombre:nombreSeguro},
          {onConflict:'nutricionista_id'}
        );
        // Leer de vuelta el código canónico de la DB
        const {data:fresh} = await supabase.from('nutricionista_codes')
          .select('code').eq('nutricionista_id', supabaseUser.id).maybeSingle();
        const finalCode = fresh?.code || codeToSave;
        setCodigoPro(finalCode);
        LS.set('professional_code', finalCode);
      }
    })();
    setLoading(true);
    supabase.from('nutrition_plans')
      .select('*')
      .eq('nutricionista_id', supabaseUser.id)
      .order('created_at', {ascending:false})
      .then(({data})=>{
        setPacientes(data||[]);
        setLoading(false);
      });
  },[supabaseUser?.id]);

  const hoy = new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'});
  const objLabels = {bajar:'Bajar peso',mantener:'Mantener peso',subir:'Ganar músculo',salud:'Salud general'};

  // Estado real del paciente: distingue "sin vincular" de "inactivo"
  const getStatus = (plan) => {
    if(!plan.paciente_id) return {color:'#C7C7CC', label:'Sin vincular'};
    if(!plan.ultima_actividad) return {color:'#C7C7CC', label:'Sin registros'};
    const diff = (Date.now() - new Date(plan.ultima_actividad).getTime()) / 86400000;
    if(diff < 1.5) return {color:'#34C759', label:'Al día'};
    if(diff < 3)   return {color:'#FF9500', label:'Hace días'};
    return {color:'#FF3B30', label:'Inactivo'};
  };

  if(!supabaseUser) {
    return (
      <div style={{minHeight:'100vh',background:dark?'#0D0D0D':'#F2F2F7',fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>👩‍⚕️</div>
        <div style={{fontSize:20,fontWeight:800,color:dark?'white':'#1C1C1E',marginBottom:8}}>Panel Profesional</div>
        <div style={{fontSize:13,color:dark?'rgba(255,255,255,0.5)':'#8E8E93',lineHeight:1.6,marginBottom:24}}>Inicia sesión para acceder<br/>a tu panel de nutricionista</div>
        <button onClick={onSwitchPersonal} style={{background:'none',border:'none',color:'#D42020',fontFamily:F,cursor:'pointer',fontSize:13,fontWeight:700}}>← Volver a modo personal</button>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh',background:dark?'#0D0D0D':'#F2F2F7',fontFamily:F,paddingBottom:100}}>
      {/* Header profesional */}
      <div style={{background:'#1D3557',paddingTop:'env(safe-area-inset-top, 20px)',paddingBottom:0}}>
        <div style={{padding:'12px 16px 0',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,borderRadius:12,background:'#D42020',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'white',flexShrink:0}}>
            {nombre.substring(0,2).toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:'white'}}>{nombre}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>{pacientes.length} paciente{pacientes.length!==1?'s':''} activo{pacientes.length!==1?'s':''}</div>
          </div>
          <div style={{background:'#D42020',borderRadius:8,padding:'3px 10px'}}>
            <span style={{fontSize:9,fontWeight:800,color:'white'}}>PRO</span>
          </div>
        </div>
        {/* Switch profesional/personal */}
        <div style={{display:'flex',gap:3,margin:'10px 16px 0',background:'rgba(255,255,255,0.1)',borderRadius:14,padding:3}}>
          <div style={{flex:1,padding:'7px',borderRadius:11,background:'#D42020',textAlign:'center'}}>
            <span style={{fontSize:11,fontWeight:700,color:'white'}}>👩‍⚕️ Profesional</span>
          </div>
          <button onClick={onSwitchPersonal} style={{flex:1,padding:'7px',borderRadius:11,background:'transparent',border:'none',cursor:'pointer',fontFamily:F}}>
            <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>👤 Personal</span>
          </button>
        </div>
        {/* Stats rápidas */}
        <div style={{display:'flex',gap:1,padding:'10px 16px 14px'}}>
          {[
            {l:'Al día',     v:pacientes.filter(p=>getStatus(p).color==='#34C759').length, c:'#34C759'},
            {l:'Sin vincular',v:pacientes.filter(p=>!p.paciente_id).length, c:'#C7C7CC'},
            {l:'Inactivos',  v:pacientes.filter(p=>getStatus(p).color==='#FF3B30').length, c:'#FF3B30'},
          ].map(({l,v,c})=>(
            <div key={l} style={{flex:1,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'14px 16px'}}>
        {/* Código de invitación */}
        <div style={{background:dark?'#1C1C1E':'white',borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`}}>
          <div style={{fontSize:11,color:dark?'rgba(255,255,255,0.5)':'#8E8E93',marginBottom:6,fontWeight:600}}>Tu código para pacientes</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontSize:22,fontWeight:800,color:'#D42020',letterSpacing:2,flex:1}}>{codigoPro}</div>
            <button onClick={()=>{navigator.clipboard?.writeText(codigoPro);haptic('light');setCopiado(true);setTimeout(()=>setCopiado(false),1500);}} style={{background:'#D4202018',border:'none',borderRadius:10,padding:'8px 12px',cursor:'pointer',fontFamily:F,fontSize:11,fontWeight:700,color:'#D42020'}}>
              {copiado?'✓ Copiado':'Copiar'}
            </button>
            <button onClick={()=>{
              const txt = `¡Hola! Te invito a usar Calorú conmigo para seguir tu nutrición. Descarga la app, crea tu cuenta y en Perfil → Ajustes ingresa mi código de nutricionista: ${codigoPro} — así activas Pro gratis y yo puedo ver tu progreso. 🥗`;
              window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
              haptic('light');
            }} style={{background:'#25D366',border:'none',borderRadius:10,padding:'8px 12px',cursor:'pointer',fontFamily:F,fontSize:11,fontWeight:700,color:'white',display:'flex',alignItems:'center',gap:4}}>
              📲 Invitar
            </button>
          </div>
          <div style={{fontSize:10,color:dark?'rgba(255,255,255,0.3)':'#C7C7CC',marginTop:6,lineHeight:1.4}}>El paciente ingresa este código en <strong>Perfil → Ajustes</strong> para vincularse contigo y activar Pro gratis</div>
        </div>

        {/* Lista de pacientes */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:700,color:dark?'white':'#1C1C1E'}}>Mis pacientes</div>
          <button onClick={()=>{setEditPlan(null);setShowNuevoPlan(true);}} style={{background:'#D42020',border:'none',borderRadius:10,padding:'6px 14px',cursor:'pointer',fontFamily:F,fontSize:12,fontWeight:700,color:'white'}}>
            + Nuevo paciente
          </button>
        </div>

        {loading&&<div style={{textAlign:'center',padding:30,color:dark?'rgba(255,255,255,0.4)':'#C7C7CC',fontSize:13}}>Cargando pacientes...</div>}

        {!loading&&pacientes.length===0&&(
          <div style={{padding:'28px 20px',background:dark?'#1C1C1E':'white',borderRadius:20,border:`1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`}}>
            <div style={{textAlign:'center',fontSize:44,marginBottom:10}}>👥</div>
            <div style={{textAlign:'center',fontSize:15,fontWeight:800,color:dark?'white':'#1C1C1E',marginBottom:14}}>Empieza con tu primer paciente</div>
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:18}}>
              {[
                {n:'1',t:'Crea el paciente',s:'Agrega su nombre, email y sus metas (calorías, objetivo, recomendaciones).'},
                {n:'2',t:'Comparte tu código',s:<>Envíale tu código <strong style={{color:'#D42020'}}>{codigoPro}</strong> por WhatsApp con el botón de arriba.</>},
                {n:'3',t:'Sigue su progreso',s:'Cuando se vincule, verás su actividad y podrás ajustar su plan cuando quieras.'},
              ].map(({n,t,s})=>(
                <div key={n} style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:24,height:24,borderRadius:12,background:'#D42020',color:'white',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{n}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:dark?'white':'#1C1C1E'}}>{t}</div>
                    <div style={{fontSize:11.5,color:dark?'rgba(255,255,255,0.45)':'#8E8E93',lineHeight:1.45,marginTop:1}}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setEditPlan(null);setShowNuevoPlan(true);}} style={{width:'100%',background:'#D42020',border:'none',borderRadius:14,padding:'13px',cursor:'pointer',fontFamily:F,fontSize:14,fontWeight:800,color:'white'}}>
              + Agregar primer paciente
            </button>
          </div>
        )}

        {!loading&&pacientes.map((plan)=>{
          const st = getStatus(plan);
          const nombrePaciente = plan.nombre || 'Paciente';
          return(
            <div key={plan.id} onClick={()=>setSelectedPaciente(plan)} style={{background:dark?'#1C1C1E':'white',borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1.5px solid ${dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:10,height:10,borderRadius:5,background:st.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:dark?'white':'#1C1C1E'}}>{nombrePaciente}</div>
                  <div style={{fontSize:11,color:dark?'rgba(255,255,255,0.4)':'#8E8E93',marginTop:2}}>{objLabels[plan.objetivo]||plan.objetivo} · {plan.calorias_meta} kcal/día</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:10,color:st.color,fontWeight:700}}>{st.label}</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Sección de hoy */}
        <div style={{fontSize:10,color:dark?'rgba(255,255,255,0.3)':'#C7C7CC',textAlign:'center',marginTop:16,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>
          {hoy}
        </div>
      </div>

      {/* Modal Nuevo / Editar Plan */}
      {showNuevoPlan&&<NuevoPlanModal C={C} F={F} dark={dark} supabaseUser={supabaseUser} editPlan={editPlan} onClose={()=>{setShowNuevoPlan(false);setEditPlan(null);}}
        onCreated={(plan)=>{setPacientes(prev=>[plan,...prev]);setShowNuevoPlan(false);setEditPlan(null);}}
        onUpdated={(plan)=>{setPacientes(prev=>prev.map(p=>p.id===plan.id?plan:p));setShowNuevoPlan(false);setEditPlan(null);setSelectedPaciente(s=>s&&s.id===plan.id?plan:s);}}/>}
      {/* Modal Detalle Paciente */}
      {selectedPaciente&&<DetallePacienteModal C={C} F={F} dark={dark} plan={selectedPaciente}
        onEdit={(plan)=>{setSelectedPaciente(null);setEditPlan(plan);setShowNuevoPlan(true);}}
        onClose={()=>setSelectedPaciente(null)} onDelete={(id)=>{setPacientes(prev=>prev.filter(p=>p.id!==id));setSelectedPaciente(null);}}/>}
    </div>
  );
}

/* ─── Modal Nuevo / Editar Pauta Nutricional (wizard profesional) ─── */
function NuevoPlanModal({C, F, dark, supabaseUser, editPlan=null, onClose, onCreated, onUpdated}) {
  const isEdit = !!editPlan;
  const recsInit = normalizeRecs(editPlan?.recomendaciones);
  const [step,   setStep]   = React.useState(0);
  const [nombre, setNombre] = React.useState(editPlan?.nombre||'');
  const [email,  setEmail]  = React.useState(editPlan?.paciente_email||'');
  const [cal,    setCal]    = React.useState(String(editPlan?.calorias_meta||'1800'));
  const [obj,    setObj]    = React.useState(editPlan?.objetivo||'bajar');
  const [msg,    setMsg]    = React.useState(editPlan?.mensaje||'');
  const [macros, setMacros] = React.useState({
    prot:  recsInit.macros.prot  ?? null,
    carbs: recsInit.macros.carbs ?? null,
    grasas:recsInit.macros.grasas?? null,
  });
  const [pauta,  setPauta]  = React.useState(()=>{
    if(recsInit.comidas.length) return recsInit.comidas.map(c=>({comida:c.comida, hora:c.hora||horaDeComida(c.comida), items:(c.items||[]).map(it=>({...it}))}));
    return ['Desayuno','Almuerzo','Once','Cena'].map(k=>({comida:k, hora:horaDeComida(k), items:[]}));
  });
  const [loading,setLoading]= React.useState(false);
  const [planError,setPlanError]= React.useState('');

  const C2 = {surface:dark?'#1C1C1E':C.surface, alt:dark?'rgba(255,255,255,0.05)':'#F2F2F7', border:dark?'rgba(255,255,255,0.1)':'#E5E5EA', text:dark?'#fff':'#1C1C1E', sec:dark?'rgba(255,255,255,0.5)':'#8E8E93', muted:dark?'rgba(255,255,255,0.3)':'#C7C7CC'};
  const objLabels = {bajar:'Bajar peso',mantener:'Mantener',subir:'Ganar músculo',salud:'Salud general'};
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const datosOk = nombre.trim() && emailValido;

  // Macros → kcal y % de distribución
  const macroKcal = macrosToKcal(macros);
  const calNum = parseInt(cal)||0;
  const macrosSet = macros.prot!=null || macros.carbs!=null || macros.grasas!=null;
  const pctOf = (g,f)=> macroKcal>0 ? Math.round(((+g||0)*f/macroKcal)*100) : 0;

  const autoDistribuir = () => {
    const c = parseInt(cal)||1800;
    const split = {bajar:[.32,.33,.35], mantener:[.25,.45,.30], subir:[.30,.45,.25], salud:[.22,.48,.30]}[obj]||[.25,.45,.30];
    setMacros({
      prot:  Math.round(c*split[0]/4),
      carbs: Math.round(c*split[1]/4),
      grasas:Math.round(c*split[2]/9),
    });
    haptic('light');
  };

  const setMacro = (k,v)=> setMacros(m=>({...m,[k]:Math.max(0, v)}));
  const addComida = (k)=> setPauta(p=> p.find(c=>c.comida===k)?p:[...p,{comida:k,hora:horaDeComida(k),items:[]}]);
  const removeComida = (k)=> setPauta(p=> p.filter(c=>c.comida!==k));
  const setHora = (k,v)=> setPauta(p=> p.map(c=> c.comida===k?{...c,hora:v}:c));
  const addItem = (k)=> setPauta(p=> p.map(c=> c.comida===k?{...c,items:[...c.items,{tipo:'',porcion:''}]}:c));
  const setItem = (k,i,field,val)=> setPauta(p=> p.map(c=> c.comida===k?{...c,items:c.items.map((it,j)=>j===i?{...it,[field]:val}:it)}:c));
  const delItem = (k,i)=> setPauta(p=> p.map(c=> c.comida===k?{...c,items:c.items.filter((_,j)=>j!==i)}:c));

  const guardar = async () => {
    if(!datosOk) { setStep(0); return; }
    setPlanError('');
    setLoading(true);
    const comidasLimpias = pauta
      .map(c=>({comida:c.comida, hora:c.hora||'', items:(c.items||[]).filter(it=>(it.tipo||'').trim()||(it.porcion||'').trim())}))
      .filter(c=>c.items.length);
    const recomendaciones = {
      v: 2,
      macros: {
        prot:  macros.prot!=null?Math.round(macros.prot):null,
        carbs: macros.carbs!=null?Math.round(macros.carbs):null,
        grasas:macros.grasas!=null?Math.round(macros.grasas):null,
      },
      comidas: comidasLimpias,
    };
    const payload = {
      nombre: nombre.trim(),
      objetivo: obj,
      calorias_meta: parseInt(cal)||1800,
      mensaje: msg.trim(),
      recomendaciones,
      paciente_email: email.trim().toLowerCase(),
    };
    if(isEdit){
      const {data,error} = await supabase.from('nutrition_plans').update(payload).eq('id',editPlan.id).select().single();
      if(error){ setPlanError('Error al guardar los cambios. Inténtalo de nuevo.'); setLoading(false); return; }
      if(data){ haptic('success'); onUpdated&&onUpdated(data); }
      setLoading(false);
      return;
    }
    const {data, error} = await supabase.from('nutrition_plans').insert({ nutricionista_id: supabaseUser.id, ...payload }).select().single();
    if(error) { setPlanError('Error al guardar la pauta. Inténtalo de nuevo.'); setLoading(false); return; }
    if(data){ haptic('success'); onCreated(data); }
    setLoading(false);
  };

  const STEPS = ['Paciente','Prescripción','Pauta'];
  const inp = {width:'100%',padding:'12px 14px',borderRadius:14,border:`1.5px solid ${C2.border}`,fontSize:15,fontWeight:700,color:C2.text,background:C2.alt,outline:'none',fontFamily:F,boxSizing:'border-box'};
  const lbl = {fontSize:11,fontWeight:700,color:C2.sec,textTransform:'uppercase',letterSpacing:.5,marginBottom:6};

  // Stepper de macro (interactivo)
  const MacroRow = ({k,label,color,unit='g'}) => {
    const val = macros[k];
    return (
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <div style={{width:9,height:9,borderRadius:5,background:color,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C2.text}}>{label}</div>
          <div style={{fontSize:10,color:C2.sec}}>{val!=null&&macroKcal>0?`${pctOf(val, MACRO_KCAL[k])}% · ${Math.round((+val||0)*MACRO_KCAL[k])} kcal`:'—'}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <button onClick={()=>setMacro(k,(+val||0)-5)} style={{width:30,height:30,borderRadius:9,border:`1.5px solid ${C2.border}`,background:C2.alt,color:C2.sec,fontSize:16,cursor:'pointer',fontFamily:F}}>−</button>
          <input value={val==null?'':val} onChange={e=>{const v=e.target.value.replace(/[^0-9]/g,'');setMacro(k, v===''?0:parseInt(v));}} placeholder="0" inputMode="numeric"
            style={{width:52,padding:'7px 4px',borderRadius:9,border:`1.5px solid ${C2.border}`,fontSize:14,fontWeight:800,color:C2.text,background:C2.alt,outline:'none',textAlign:'center',fontFamily:F}}/>
          <span style={{fontSize:11,color:C2.sec,width:10}}>{unit}</span>
          <button onClick={()=>setMacro(k,(+val||0)+5)} style={{width:30,height:30,borderRadius:9,border:'none',background:color,color:'white',fontSize:16,cursor:'pointer',fontFamily:F}}>+</button>
        </div>
      </div>
    );
  };

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'flex-end'}}>
      <div style={{background:C2.surface,borderRadius:'24px 24px 0 0',width:'100%',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header con progreso */}
        <div style={{padding:'14px 20px 0',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
            <div style={{width:36,height:4,borderRadius:2,background:C2.muted}}/>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontSize:18,fontWeight:800,color:C2.text}}>{isEdit?'Editar pauta':'Nueva pauta'}{nombre.trim()?` · ${nombre.trim().split(' ')[0]}`:''}</div>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,color:C2.muted,cursor:'pointer',padding:'0 4px'}}>✕</button>
          </div>
          {/* Stepper */}
          <div style={{display:'flex',gap:6,marginBottom:16}}>
            {STEPS.map((s,i)=>(
              <button key={s} onClick={()=>{ if(i===0||datosOk) setStep(i); }} style={{flex:1,cursor:'pointer',border:'none',background:'none',fontFamily:F,padding:0,textAlign:'left'}}>
                <div style={{height:4,borderRadius:2,background:i<=step?'#D42020':C2.border,marginBottom:5,transition:'background .2s'}}/>
                <div style={{fontSize:10,fontWeight:i===step?800:600,color:i===step?'#D42020':C2.sec}}>{i+1}. {s}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{flex:1,overflowY:'auto',padding:'4px 20px 12px'}}>
          {/* ── PASO 1: Paciente ── */}
          {step===0&&(
            <div style={{animation:'fadeUp .25s ease'}}>
              <div style={{marginBottom:14}}>
                <div style={lbl}>Nombre del paciente</div>
                <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: María González" type="text" style={inp}/>
              </div>
              <div style={{marginBottom:14}}>
                <div style={lbl}>Email del paciente</div>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Ej: maria@gmail.com" type="email" inputMode="email" autoCapitalize="none"
                  style={{...inp,border:`1.5px solid ${email&&!emailValido?'#FF3B30':C2.border}`}}/>
                <div style={{fontSize:11,color:email&&!emailValido?'#FF3B30':C2.muted,marginTop:5,lineHeight:1.4}}>
                  {email&&!emailValido?'Ingresa un email válido.':'⚠️ Debe ser el MISMO correo con que tu paciente se registra en Calorú — así se vincula automáticamente.'}
                </div>
              </div>
              <div>
                <div style={lbl}>Objetivo</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[{k:'bajar',l:'Bajar peso',e:'📉'},{k:'mantener',l:'Mantener',e:'⚖️'},{k:'subir',l:'Ganar músculo',e:'💪'},{k:'salud',l:'Salud general',e:'🌿'}].map(({k,l,e})=>(
                    <button key={k} onClick={()=>setObj(k)} style={{padding:'13px 10px',borderRadius:14,textAlign:'left',border:`1.5px solid ${obj===k?'#D42020':C2.border}`,background:obj===k?'#D4202012':C2.alt,color:obj===k?'#D42020':C2.sec,fontFamily:F,cursor:'pointer',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:18}}>{e}</span>{l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Prescripción energética + macros ── */}
          {step===1&&(
            <div style={{animation:'fadeUp .25s ease'}}>
              <div style={{marginBottom:16}}>
                <div style={lbl}>Requerimiento energético (kcal/día)</div>
                <input value={cal} onChange={e=>setCal(e.target.value.replace(/[^0-9]/g,''))} placeholder="1800" inputMode="numeric" style={{...inp,fontSize:20,textAlign:'center'}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <div style={lbl}>Distribución de macronutrientes</div>
                <button onClick={autoDistribuir} style={{fontSize:11,fontWeight:800,color:'#D42020',background:'#D4202012',border:'none',borderRadius:9,padding:'6px 10px',cursor:'pointer',fontFamily:F}}>✨ Auto</button>
              </div>
              {/* Barra de distribución */}
              {macroKcal>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{display:'flex',height:12,borderRadius:6,overflow:'hidden',marginBottom:6}}>
                    <div style={{width:`${pctOf(macros.prot,4)}%`,background:'#34C759'}}/>
                    <div style={{width:`${pctOf(macros.carbs,4)}%`,background:'#FF9500'}}/>
                    <div style={{width:`${pctOf(macros.grasas,9)}%`,background:'#5856D6'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:C2.sec}}>
                    <span>Total: <strong style={{color:C2.text}}>{macroKcal} kcal</strong></span>
                    {calNum>0&&<span style={{color:Math.abs(macroKcal-calNum)<=80?'#34C759':'#FF9500'}}>
                      {Math.abs(macroKcal-calNum)<=80?'✓ Calza con la meta':`${macroKcal>calNum?'+':''}${macroKcal-calNum} kcal vs meta`}
                    </span>}
                  </div>
                </div>
              )}
              <div style={{background:C2.alt,borderRadius:16,padding:'14px 14px 6px'}}>
                <MacroRow k="prot"   label="Proteínas"      color="#34C759"/>
                <MacroRow k="carbs"  label="Carbohidratos"  color="#FF9500"/>
                <MacroRow k="grasas" label="Lípidos"        color="#5856D6"/>
              </div>
              {!macrosSet&&<div style={{fontSize:11,color:C2.muted,marginTop:10,textAlign:'center',lineHeight:1.4}}>Opcional. Toca <strong>✨ Auto</strong> para distribuir según el objetivo, o ajústalo manualmente.</div>}
            </div>
          )}

          {/* ── PASO 3: Pauta por tiempos de comida ── */}
          {step===2&&(
            <div style={{animation:'fadeUp .25s ease'}}>
              <div style={{...lbl,marginBottom:10}}>Pauta alimentaria por tiempo de comida</div>
              {pauta.map(c=>{
                const meta = PAUTA_COMIDAS.find(m=>m.k===c.comida) || {icon:'🍽️',color:'#8E8E93'};
                return (
                  <div key={c.comida} style={{background:C2.alt,borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1px solid ${C2.border}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <span style={{fontSize:16}}>{meta.icon}</span>
                      <div style={{flex:1,fontSize:13.5,fontWeight:800,color:meta.color}}>{c.comida}</div>
                      <div style={{display:'flex',alignItems:'center',gap:5,background:C2.surface,borderRadius:9,padding:'5px 9px',border:`1px solid ${C2.border}`}}>
                        <span style={{fontSize:12}}>🕐</span>
                        <input type="time" value={c.hora||''} onChange={e=>setHora(c.comida,e.target.value)}
                          style={{border:'none',background:'none',color:C2.text,fontSize:12.5,fontWeight:700,fontFamily:F,outline:'none',width:62,padding:0}}/>
                      </div>
                      <button onClick={()=>removeComida(c.comida)} style={{background:'none',border:'none',color:C2.muted,fontSize:13,cursor:'pointer'}}>✕</button>
                    </div>
                    {c.items.map((it,i)=>(
                      <div key={i} style={{display:'flex',gap:6,marginBottom:6}}>
                        <input value={it.tipo} onChange={e=>setItem(c.comida,i,'tipo',e.target.value)} placeholder="Alimento / grupo"
                          style={{flex:1.3,padding:'9px 11px',borderRadius:10,border:`1px solid ${C2.border}`,fontSize:12.5,color:C2.text,background:C2.surface,outline:'none',fontFamily:F,minWidth:0}}/>
                        <input value={it.porcion} onChange={e=>setItem(c.comida,i,'porcion',e.target.value)} placeholder="Porción"
                          style={{flex:1,padding:'9px 11px',borderRadius:10,border:`1px solid ${C2.border}`,fontSize:12.5,color:C2.text,background:C2.surface,outline:'none',fontFamily:F,minWidth:0}}/>
                        <button onClick={()=>delItem(c.comida,i)} style={{width:32,borderRadius:10,border:`1px solid ${C2.border}`,background:C2.surface,color:C2.muted,fontSize:12,cursor:'pointer',flexShrink:0}}>✕</button>
                      </div>
                    ))}
                    <button onClick={()=>addItem(c.comida)} style={{fontSize:11.5,color:meta.color,background:'none',border:'none',cursor:'pointer',fontFamily:F,fontWeight:700,padding:'4px 0'}}>+ Agregar alimento</button>
                  </div>
                );
              })}
              {/* Agregar tiempos de comida que falten */}
              {PAUTA_COMIDAS.filter(m=>!pauta.find(c=>c.comida===m.k)).length>0&&(
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  {PAUTA_COMIDAS.filter(m=>!pauta.find(c=>c.comida===m.k)).map(m=>(
                    <button key={m.k} onClick={()=>addComida(m.k)} style={{padding:'7px 12px',borderRadius:10,border:`1px dashed ${C2.border}`,background:'none',color:C2.sec,fontFamily:F,cursor:'pointer',fontSize:11.5,fontWeight:700}}>
                      + {m.icon} {m.k}
                    </button>
                  ))}
                </div>
              )}
              {/* Indicaciones generales */}
              <div style={{marginTop:6}}>
                <div style={lbl}>Indicaciones generales</div>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ej: Beber 2 L de agua al día, evitar frituras, caminar 30 min..."
                  style={{...inp,fontSize:13,fontWeight:500,minHeight:80,resize:'none'}}/>
              </div>
            </div>
          )}

          {planError&&<div style={{color:'#FF3B30',fontSize:12,fontWeight:600,marginTop:12,textAlign:'center',padding:'8px 12px',background:'#FF3B3010',borderRadius:10}}>{planError}</div>}
        </div>

        {/* Footer navegación */}
        <div style={{flexShrink:0,padding:'12px 20px calc(20px + env(safe-area-inset-bottom))',borderTop:`1px solid ${C2.border}`,display:'flex',gap:10}}>
          {step>0
            ? <button onClick={()=>setStep(step-1)} style={{flex:1,padding:'14px',borderRadius:14,border:`1px solid ${C2.border}`,background:'none',color:C2.sec,fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:700}}>‹ Atrás</button>
            : <button onClick={onClose} style={{flex:1,padding:'14px',borderRadius:14,border:`1px solid ${C2.border}`,background:'none',color:C2.sec,fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:600}}>Cancelar</button>}
          {step<2
            ? <button onClick={()=>{ if(step===0&&!datosOk){ setPlanError('Completa nombre y email válido para continuar.'); return;} setPlanError(''); setStep(step+1); }}
                style={{flex:2,padding:'14px',borderRadius:14,border:'none',background:(step===0&&!datosOk)?'#C7C7CC':'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800}}>Continuar ›</button>
            : <button onClick={guardar} disabled={loading} style={{flex:2,padding:'14px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800}}>
                {loading?'Guardando...':isEdit?'Guardar pauta ✓':'Crear pauta ✓'}
              </button>}
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Detalle Paciente ─── */
function DetallePacienteModal({C, F, dark, plan, onClose, onDelete, onEdit}) {
  const [deleting, setDeleting] = React.useState(false);
  const [pLogs, setPLogs] = React.useState(null); // null = cargando
  const [selDia, setSelDia] = React.useState(null); // día seleccionado para ver detalle
  const objLabels = {bajar:'Bajar peso',mantener:'Mantener peso',subir:'Ganar músculo',salud:'Salud general'};
  const planMac = normalizeRecs(plan.recomendaciones).macros||{};

  // Cargar progreso del paciente (últimos 7 días) si está vinculado
  React.useEffect(()=>{
    if(!plan.paciente_id){ setPLogs([]); return; }
    let cancel=false;
    supabase.from('daily_logs')
      .select('date,log')
      .eq('user_id', plan.paciente_id)
      .order('date',{ascending:false})
      .limit(7)
      .then(({data})=>{ if(!cancel) setPLogs(data||[]); }, ()=>{ if(!cancel) setPLogs([]); });
    return ()=>{ cancel=true; };
  },[plan.paciente_id]);

  const handleDelete = async () => {
    if(!window.confirm('¿Eliminar este plan? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    await supabase.from('nutrition_plans').delete().eq('id', plan.id);
    onDelete(plan.id);
  };

  const lastAct = plan.ultima_actividad
    ? new Date(plan.ultima_actividad).toLocaleDateString('es-CL',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})
    : null;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'flex-end'}}>
      <div style={{background:dark?'#1C1C1E':C.surface,borderRadius:'24px 24px 0 0',width:'100%',maxHeight:'85vh',overflow:'auto',padding:'20px 20px 40px',paddingBottom:'calc(40px + env(safe-area-inset-bottom))'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:12}}>
          <div style={{width:36,height:4,borderRadius:2,background:dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
          <div style={{flex:1}}>
            <div style={{fontSize:19,fontWeight:800,color:C.text}}>{plan.nombre}</div>
            <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{objLabels[plan.objetivo]||plan.objetivo} · {plan.calorias_meta} kcal/día</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,color:C.textMuted,cursor:'pointer',padding:'4px 8px'}}>✕</button>
        </div>

        {/* Última actividad */}
        <div style={{background:dark?'rgba(255,255,255,0.06)':'#F2F2F7',borderRadius:14,padding:'10px 14px',marginBottom:12,display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:16}}>📅</span>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:C.textSec}}>Última actividad</div>
            <div style={{fontSize:12,color:C.text,fontWeight:600}}>{lastAct||'Sin registros aún'}</div>
          </div>
        </div>

        {/* Email del paciente */}
        {plan.paciente_email&&(
          <div style={{background:dark?'rgba(255,255,255,0.06)':'#F2F2F7',borderRadius:14,padding:'10px 14px',marginBottom:12,display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:16}}>📧</span>
            <div style={{minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec}}>Email</div>
              <div style={{fontSize:12,color:C.text,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{plan.paciente_email}</div>
            </div>
            <div style={{marginLeft:'auto',flexShrink:0}}>
              <div style={{fontSize:10,fontWeight:700,color:plan.paciente_id?'#34C759':'#FF9500'}}>
                {plan.paciente_id?'✓ Vinculado':'Esperando vinculación'}
              </div>
            </div>
          </div>
        )}
        {/* Aviso si aún no se vincula */}
        {!plan.paciente_id&&(
          <div style={{background:'#FF950012',border:'1px solid #FF950030',borderRadius:14,padding:'10px 14px',marginBottom:12}}>
            <div style={{fontSize:11.5,color:'#B36A00',lineHeight:1.5}}>
              Tu paciente aún no se vincula. Pídele que cree su cuenta en Calorú con <strong>{plan.paciente_email||'el email indicado'}</strong> e ingrese tu código en <strong>Perfil → Ajustes</strong>. El email debe coincidir exactamente.
            </div>
          </div>
        )}

        {/* Progreso del paciente (últimos 7 días) */}
        {plan.paciente_id&&(()=>{
          const calTarget = plan.calorias_meta || 0;
          const dias = (pLogs||[]).map(r=>({date:r.date, log:r.log||[], cal:Math.round(sumLog(r.log||[]).cal)})).filter(d=>d.cal>0);
          const enMeta = calTarget>0 ? dias.filter(d=>d.cal>=calTarget*0.9 && d.cal<=calTarget*1.1).length : 0;
          const maxCal = Math.max(calTarget, ...dias.map(d=>d.cal), 1);
          return (
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5}}>Progreso · últimos 7 días</div>
                {calTarget>0&&dias.length>0&&<div style={{fontSize:11,fontWeight:800,color:enMeta>=dias.length*0.7?'#34C759':enMeta>0?'#FF9500':'#FF3B30'}}>{enMeta}/{dias.length} en meta</div>}
              </div>
              {pLogs===null
                ? <div style={{fontSize:12,color:C.textMuted,textAlign:'center',padding:'12px 0'}}>Cargando…</div>
                : dias.length===0
                  ? <div style={{fontSize:12,color:C.textMuted,textAlign:'center',padding:'14px 0',background:dark?'rgba(255,255,255,0.04)':'#F2F2F7',borderRadius:12}}>Sin registros todavía.</div>
                  : (
                    <div style={{background:dark?'rgba(255,255,255,0.04)':'#F2F2F7',borderRadius:14,padding:'12px 14px'}}>
                      {dias.map((d,i)=>{
                        const col = calTarget===0?'#1D3557':(d.cal>=calTarget*0.9&&d.cal<=calTarget*1.1)?'#34C759':d.cal<calTarget*0.9?'#FF9500':'#FF3B30';
                        const fecha = new Date(d.date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short',day:'numeric'});
                        return (
                          <button key={i} className="tap" onClick={()=>{setSelDia(d);haptic('light');}} style={{width:'100%',display:'flex',alignItems:'center',gap:10,marginBottom:i<dias.length-1?8:0,background:'none',border:'none',cursor:'pointer',fontFamily:F,padding:0}}>
                            <div style={{width:52,fontSize:11,color:C.textSec,fontWeight:600,textTransform:'capitalize',flexShrink:0,textAlign:'left'}}>{fecha}</div>
                            <div style={{flex:1,height:8,borderRadius:4,background:dark?'rgba(255,255,255,0.08)':'#E5E5EA',overflow:'hidden'}}>
                              <div style={{width:`${Math.min((d.cal/maxCal)*100,100)}%`,height:'100%',background:col,borderRadius:4}}/>
                            </div>
                            <div style={{width:58,textAlign:'right',fontSize:11,fontWeight:700,color:col,flexShrink:0}}>{d.cal} kcal</div>
                            <span style={{fontSize:13,color:C.textMuted,flexShrink:0}}>›</span>
                          </button>
                        );
                      })}
                      {calTarget>0&&<div style={{fontSize:10,color:C.textMuted,marginTop:8,textAlign:'center'}}>Meta: {calTarget} kcal/día · 🟢 en meta · 🟠 bajo · 🔴 sobre</div>}
                    </div>
                  )}
            </div>
          );
        })()}

        {/* Mensaje */}
        {plan.mensaje&&(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Mensaje al paciente</div>
            <div style={{background:dark?'rgba(255,255,255,0.06)':'#F2F2F7',borderRadius:14,padding:'12px 14px',fontSize:13,color:C.text,lineHeight:1.5,fontStyle:'italic'}}>"{plan.mensaje}"</div>
          </div>
        )}

        {/* Prescripción: macros */}
        {(()=>{
          const norm = normalizeRecs(plan.recomendaciones);
          const mac = norm.macros||{};
          const tieneMacros = mac.prot!=null||mac.carbs!=null||mac.grasas!=null;
          return (<>
            {tieneMacros&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Prescripción de macronutrientes</div>
                <div style={{display:'flex',gap:8}}>
                  {[{l:'Proteínas',v:mac.prot,c:'#34C759'},{l:'Carbohid.',v:mac.carbs,c:'#FF9500'},{l:'Lípidos',v:mac.grasas,c:'#5856D6'}].map(({l,v,c})=>(
                    <div key={l} style={{flex:1,background:dark?'rgba(255,255,255,0.06)':'#F2F2F7',borderRadius:14,padding:'10px 8px',textAlign:'center',borderTop:`3px solid ${c}`}}>
                      <div style={{fontSize:17,fontWeight:800,color:C.text}}>{v!=null?v:'—'}<span style={{fontSize:10,fontWeight:600,color:C.textSec}}>g</span></div>
                      <div style={{fontSize:9.5,color:C.textSec,fontWeight:600,marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Pauta por tiempos de comida */}
            {norm.comidas.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Pauta alimentaria</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {norm.comidas.map((c,ci)=>{
                    const meta = PAUTA_COMIDAS.find(m=>m.k===c.comida) || {icon:'🍽️',color:'#8E8E93'};
                    return (
                      <div key={ci} style={{background:dark?'rgba(255,255,255,0.05)':'#F2F2F7',borderRadius:14,padding:'10px 12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
                          <span style={{fontSize:14}}>{meta.icon}</span>
                          <span style={{fontSize:12.5,fontWeight:800,color:meta.color}}>{c.comida}</span>
                          {c.hora&&<span style={{marginLeft:'auto',fontSize:11,fontWeight:700,color:meta.color,background:meta.color+'18',borderRadius:8,padding:'2px 8px'}}>🕐 {c.hora}</span>}
                        </div>
                        {(c.items||[]).map((it,i)=>(
                          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'3px 0',borderTop:i>0?`1px solid ${dark?'rgba(255,255,255,0.06)':'#E5E5EA'}`:'none'}}>
                            <span style={{fontSize:12.5,color:C.text}}>{it.tipo}</span>
                            <span style={{fontSize:11,color:C.textSec,fontWeight:600}}>{it.porcion}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>);
        })()}

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>onEdit&&onEdit(plan)} style={{flex:2,padding:'13px',borderRadius:14,border:'none',background:'#1D3557',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800}}>
            ✏️ Editar plan
          </button>
          <button onClick={handleDelete} disabled={deleting} style={{flex:1,padding:'13px',borderRadius:14,border:'1px solid #FF3B30',background:'none',color:'#FF3B30',fontFamily:F,cursor:'pointer',fontSize:13,fontWeight:700}}>
            {deleting?'...':'🗑'}
          </button>
        </div>
      </div>

      {/* ── Detalle de un día: qué comió el paciente ── */}
      {selDia&&(()=>{
        const t = sumLog(selDia.log);
        const fechaFull = new Date(selDia.date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'});
        const calTarget = plan.calorias_meta||0;
        const calCol = calTarget===0?'#1D3557':(t.cal>=calTarget*0.9&&t.cal<=calTarget*1.1)?'#34C759':t.cal<calTarget*0.9?'#FF9500':'#FF3B30';
        const macroCards = [
          {l:'Proteínas',v:t.prot,  meta:planMac.prot,  u:'g', c:'#34C759'},
          {l:'Carbohid.',v:t.carbs, meta:planMac.carbs, u:'g', c:'#FF9500'},
          {l:'Lípidos',  v:t.grasas,meta:planMac.grasas,u:'g', c:'#5856D6'},
          {l:'Fibra',    v:t.fibra, meta:null, u:'g', c:'#A2845E'},
          {l:'Azúcar',   v:t.azucar,meta:null, u:'g', c:'#FF2D55'},
          {l:'Sodio',    v:t.sodio, meta:null, u:'mg',c:'#5AC8FA'},
        ];
        return (
          <div style={{position:'fixed',inset:0,zIndex:10000,background:dark?'#0D0D0D':'#F2F2F7',display:'flex',flexDirection:'column',fontFamily:F,animation:'fadeUp .25s ease'}}>
            <div style={{display:'flex',alignItems:'center',padding:'14px 16px',paddingTop:'calc(14px + env(safe-area-inset-top))',borderBottom:`1px solid ${dark?'rgba(255,255,255,0.08)':'#E5E5EA'}`,background:dark?'#1C1C1E':'white'}}>
              <button onClick={()=>setSelDia(null)} style={{background:'none',border:'none',color:'#D42020',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F}}>‹ Volver</button>
              <div style={{flex:1,textAlign:'center',fontSize:14,fontWeight:800,color:dark?'white':'#1C1C1E',textTransform:'capitalize'}}>{fechaFull}</div>
              <div style={{width:60}}/>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'14px 16px calc(24px + env(safe-area-inset-bottom))'}}>
              {/* Total + meta */}
              <div style={{background:dark?'#1C1C1E':'white',borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${dark?'rgba(255,255,255,0.08)':'#E5E5EA'}`,textAlign:'center'}}>
                <div style={{fontSize:30,fontWeight:800,color:calCol,lineHeight:1}}>{Math.round(t.cal)}<span style={{fontSize:13,color:C.textSec,fontWeight:600}}> kcal</span></div>
                {calTarget>0&&<div style={{fontSize:11,color:C.textSec,marginTop:4}}>Meta: {calTarget} kcal · {t.cal>=calTarget*0.9&&t.cal<=calTarget*1.1?'🟢 en meta':t.cal<calTarget*0.9?`🟠 ${Math.round(calTarget-t.cal)} bajo la meta`:`🔴 ${Math.round(t.cal-calTarget)} sobre la meta`}</div>}
              </div>
              {/* Macros + micros */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
                {macroCards.map(({l,v,meta,u,c})=>(
                  <div key={l} style={{background:dark?'#1C1C1E':'white',borderRadius:14,padding:'10px 6px',textAlign:'center',border:`1px solid ${dark?'rgba(255,255,255,0.08)':'#E5E5EA'}`,borderTop:`3px solid ${c}`}}>
                    <div style={{fontSize:15,fontWeight:800,color:dark?'white':'#1C1C1E'}}>{Math.round(v||0)}<span style={{fontSize:9,color:C.textSec,fontWeight:600}}>{u}</span></div>
                    <div style={{fontSize:9.5,color:C.textSec,fontWeight:600,marginTop:1}}>{l}</div>
                    {meta!=null&&<div style={{fontSize:8.5,color:C.textMuted,marginTop:1}}>meta {meta}{u}</div>}
                  </div>
                ))}
              </div>
              {/* Micronutrientes (vitaminas y minerales) */}
              {(()=>{
                const mic = sumMicros(selDia.log);
                return (
                  <div style={{marginBottom:14}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5}}>Vitaminas y minerales</div>
                      {mic._anyEst&&<span style={{fontSize:9,color:C.textMuted}}>~ algunos estimados</span>}
                    </div>
                    <div style={{background:dark?'#1C1C1E':'white',borderRadius:16,padding:'12px 14px',border:`1px solid ${dark?'rgba(255,255,255,0.08)':'#E5E5EA'}`}}>
                      {MICROS.map((x,i)=>{
                        const v = mic[x.k]||0; const pct = Math.min(Math.round((v/x.rda)*100),100);
                        const col = pct>=70?'#34C759':pct>=35?'#FF9500':'#FF3B30';
                        return (
                          <div key={x.k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<MICROS.length-1?9:0}}>
                            <span style={{fontSize:14,width:18,flexShrink:0}}>{x.e}</span>
                            <div style={{width:96,fontSize:11.5,color:dark?'white':'#1C1C1E',fontWeight:600,flexShrink:0}}>{x.l}</div>
                            <div style={{flex:1,height:7,borderRadius:4,background:dark?'rgba(255,255,255,0.08)':'#F2F2F7',overflow:'hidden'}}>
                              <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:4}}/>
                            </div>
                            <div style={{width:78,textAlign:'right',fontSize:11,fontWeight:700,color:dark?'white':'#1C1C1E',flexShrink:0}}>{v>=100?Math.round(v):v.toFixed(1)}<span style={{fontSize:9,color:C.textSec}}>{x.u}</span></div>
                            <div style={{width:34,textAlign:'right',fontSize:10,fontWeight:700,color:col,flexShrink:0}}>{pct}%</div>
                          </div>
                        );
                      })}
                      <div style={{fontSize:9,color:C.textMuted,marginTop:10,textAlign:'center'}}>% del valor diario recomendado (adulto)</div>
                    </div>
                  </div>
                );
              })()}

              {/* Comidas con alimentos */}
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Lo que comió</div>
              {['Desayuno','Almuerzo','Once','Cena','Snack'].map(m=>{
                const items=(selDia.log||[]).filter(r=>r.comida===m);
                if(!items.length) return null;
                const mCal=items.reduce((s,it)=>s+it.cal*itemRatio(it)*it.qty,0);
                return (
                  <div key={m} style={{background:dark?'#1C1C1E':'white',borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1px solid ${dark?'rgba(255,255,255,0.08)':'#E5E5EA'}`}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:dark?'white':'#1C1C1E'}}>{MI[m]} {m}</span>
                      <span style={{fontSize:11,fontWeight:700,color:C.textSec}}>{Math.round(mCal)} kcal</span>
                    </div>
                    {items.map((it,i)=>{
                      const r=itemRatio(it), q=it.qty;
                      const porc = it.grams?`${it.grams}g`:`${it.porcion||100}g`;
                      return (
                        <div key={i} style={{padding:'6px 0',borderTop:i>0?`1px solid ${dark?'rgba(255,255,255,0.06)':'#F2F2F7'}`:'none'}}>
                          <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                            <span style={{fontSize:12.5,color:dark?'white':'#1C1C1E',fontWeight:600}}>{it.emoji} {it.nombre}{q>1?` ×${q}`:''}</span>
                            <span style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>{Math.round(it.cal*r*q)} kcal</span>
                          </div>
                          <div style={{fontSize:10,color:C.textSec,marginTop:2}}>
                            {porc} · P {Math.round(it.prot*r*q)}g · C {Math.round(it.carbs*r*q)}g · G {Math.round(it.grasas*r*q)}g{it.azucar?` · Az ${Math.round((it.azucar||0)*r*q)}g`:''}{it.sodio?` · Na ${Math.round((it.sodio||0)*r*q)}mg`:''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGRO DESBLOQUEADO — diferenciador visual
═══════════════════════════════════════════════════════ */
function LogroUnlockModal({C, F, logro, onClose}) {
  React.useEffect(()=>{
    const t = setTimeout(onClose, 6000);
    return ()=>clearTimeout(t);
  },[]);
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:24}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#1C1C1E',borderRadius:28,padding:'32px 28px',maxWidth:320,width:'100%',textAlign:'center',border:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{fontSize:56,marginBottom:12,lineHeight:1}}>{logro.icon}</div>
        <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.5)',marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>¡Logro desbloqueado!</div>
        <div style={{fontSize:22,fontWeight:800,color:'#FFD700',marginBottom:10,lineHeight:1.2}}>{logro.titulo}</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.5,marginBottom:16}}>{logro.desc}</div>
        <div style={{background:'rgba(255,215,0,0.1)',borderRadius:14,padding:'10px 16px',marginBottom:20,display:'inline-block'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:2}}>XP ganado</div>
          <div style={{fontSize:26,fontWeight:800,color:'#FFD700'}}>+{logro.xp} XP</div>
        </div>
        <button onClick={onClose} style={{width:'100%',padding:'13px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800}}>¡Genial! 🚀</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WELCOME BACK — modal de retención al volver
═══════════════════════════════════════════════════════ */
function WelcomeBack({C, F, nombre, streak, daysAway, onClose}) {
  const alive = streak.days > 0;
  const msg = daysAway<=1?`¡Bienvenido, ${nombre}!`:daysAway<=3?`¡Te extrañamos, ${nombre}!`:`¡${nombre} volvió!`;
  const sub = daysAway<=1?'Tu racha sigue viva. No la pierdas hoy.'
    :daysAway<=3?`${daysAway} días sin registrar. Retomar es lo más difícil — ya lo hiciste.`
    :daysAway<=14?'Una semana fuera no borra tu progreso. Empecemos de nuevo.'
    :'Cada experto fue principiante. Hoy es día 1.';
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:80,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:340,background:`linear-gradient(160deg, ${C.surface}, ${C.red}08)`,borderRadius:28,padding:'28px 22px',textAlign:'center',animation:'wbModalIn .5s cubic-bezier(.34,1.56,.64,1) both',border:`1px solid ${C.red}15`}}>
        <div style={{marginBottom:18,animation:'wbLogoIn .7s cubic-bezier(.34,1.56,.64,1) .15s both'}}><Logo size={80}/></div>
        <div style={{fontSize:22,fontWeight:800,color:C.text,lineHeight:1.3,marginBottom:6,letterSpacing:'-.5px'}}>{msg}</div>
        <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:22,maxWidth:280,margin:'0 auto 22px'}}>{sub}</div>
        <div style={{display:'flex',gap:8,marginBottom:22}}>
          {[{l:'Racha',v:alive?`${streak.days}`:'0',emoji:'🔥',c:C.amber},{l:'Días fuera',v:`${daysAway}`,emoji:'📅',c:C.red}].map(({l,v,emoji,c})=>(
            <div key={l} style={{flex:1,background:`${c}0A`,borderRadius:16,padding:'12px 8px',border:`1px solid ${c}18`}}>
              <div style={{fontSize:22,fontWeight:800,color:c}}>{emoji} {v}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:3,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
        <button className="tap" onClick={onClose} style={{width:'100%',padding:'15px',borderRadius:16,border:'none',background:`linear-gradient(135deg, ${C.red}, ${C.accentLight||C.red})`,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F,boxShadow:`0 8px 28px ${C.red}40`}}>
          {daysAway<=1?'¡Seguir registrando!':'Empezar de nuevo 💪'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MILESTONE CELEBRATION — celebración de logros
═══════════════════════════════════════════════════════ */
const MILESTONES = {
  streak7:{emoji:'🔥',title:'¡7 días seguidos!',sub:'Una semana completa. Eso es disciplina real.',badge:'Semana Perfecta',ck:'amber'},
  streak14:{emoji:'⚡',title:'¡14 días de racha!',sub:'Dos semanas. Ya es un hábito.',badge:'Imparable',ck:'amber'},
  streak30:{emoji:'👑',title:'¡30 días!',sub:'Un mes completo. Eres parte del 5% que llega aquí.',badge:'Leyenda',ck:'red'},
  streak60:{emoji:'💎',title:'¡60 días!',sub:'Esto ya es parte de tu vida.',badge:'Diamante',ck:'blue'},
  first_scan:{emoji:'📸',title:'¡Primera foto IA!',sub:'Escaneaste tu primer plato. El futuro es ahora.',badge:'Explorador IA',ck:'green'},
  foods_50:{emoji:'🍽️',title:'50 registros',sub:'Conoces tu cuerpo mejor que nunca.',badge:'Foodie',ck:'red'},
  foods_200:{emoji:'🏆',title:'200 registros',sub:'Doscientas comidas. Eres un profesional.',badge:'Nutricionista',ck:'amber'},
  goal_7:{emoji:'🎯',title:'7 días en meta',sub:'Una semana entera dentro de tu objetivo calórico.',badge:'Precisión',ck:'green'},
};
function MilestoneCelebration({C, F, milestone, onClose}) {
  const m = MILESTONES[milestone]||MILESTONES.streak7;
  const c = C[m.ck]||C.red;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:90,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:F}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:320,background:`linear-gradient(160deg, ${C.surface}, ${c}10)`,borderRadius:28,padding:'32px 24px',textAlign:'center',animation:'msIn .6s cubic-bezier(.34,1.56,.64,1) both',border:`1.5px solid ${c}20`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:`linear-gradient(105deg, transparent 40%, ${c}0A 50%, transparent 60%)`,animation:'msShimmer 2.5s ease infinite'}}/>
        <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 14px',borderRadius:20,background:`${c}15`,border:`1px solid ${c}25`,marginBottom:20,position:'relative'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:c,boxShadow:`0 0 10px ${c}`}}/>
          <span style={{fontSize:10,fontWeight:700,color:c,textTransform:'uppercase',letterSpacing:1}}>{m.badge}</span>
        </div>
        <div style={{fontSize:68,marginBottom:14,position:'relative',animation:'msEmoji .8s cubic-bezier(.34,1.56,.64,1) .2s both',filter:`drop-shadow(0 4px 18px ${c}35)`}}>{m.emoji}</div>
        <div style={{fontSize:24,fontWeight:800,color:C.text,lineHeight:1.2,marginBottom:8,letterSpacing:'-1px',position:'relative'}}>{m.title}</div>
        <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:28,maxWidth:260,margin:'0 auto 28px',position:'relative'}}>{m.sub}</div>
        <button className="tap" onClick={onClose} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:`linear-gradient(135deg, ${c}, ${c}CC)`,color:'white',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:F,boxShadow:`0 8px 24px ${c}35`,position:'relative'}}>¡Seguir así!</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DAILY CHALLENGE CARD — reto diario para retención
═══════════════════════════════════════════════════════ */
function DailyChallengeCard({C, F, log, agua}) {
  const dark = C.surface !== '#FFFFFF';
  const challenges = [
    {emoji:'🥦',text:'Come 3 porciones de verduras hoy',reward:'+15 pts',c:C.green},
    {emoji:'💧',text:'Toma 8 vasos de agua',reward:'+10 pts',c:'#D42020'},
    {emoji:'🇨🇱',text:'Come un plato chileno hoy',reward:'+15 pts',c:'#D42020'},
    {emoji:'🥗',text:'Come 3 porciones de verdura',reward:'+20 pts',c:'#34C759'},
    {emoji:'🏃',text:'30 min de ejercicio',reward:'+25 pts',c:'#FF9500'},
    {emoji:'🌙',text:'Registra tus 3 comidas',reward:'+30 pts',c:'#5856D6'},
    {emoji:'🥩',text:'Llega a tu meta de proteína',reward:'+20 pts',c:C.red},
    {emoji:'🚫',text:'Día sin azúcar añadida',reward:'+25 pts',c:C.amber},
    {emoji:'📸',text:'Escanea tu almuerzo con IA',reward:'+15 pts',c:C.purple},
    {emoji:'🥗',text:'Almuerza menos de 600 kcal',reward:'+20 pts',c:C.green},
    {emoji:'🌅',text:'Registra las 4 comidas del día',reward:'+30 pts',c:C.amber},
  ];
  const ch = challenges[new Date().getDay()%challenges.length];
  const [done, setDone] = useState(()=>LS.get('challenge_done_'+todayKey(), false));
  const toggleDone = () => { const v = !done; setDone(v); LS.set('challenge_done_'+todayKey(), v); };
  return (
    <div onClick={toggleDone} style={{
      background:`linear-gradient(135deg, ${ch.c}0A, transparent)`,
      borderRadius:18,padding:'13px 14px',border:`1px solid ${ch.c}18`,
      display:'flex',alignItems:'center',gap:12,fontFamily:F,
      cursor:'pointer',transition:'opacity .3s',opacity:done?.55:1,marginBottom:10,
    }}>
      <div style={{width:42,height:42,borderRadius:14,background:done?`${C.green}18`:`${ch.c}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:done?20:22,flexShrink:0,border:`1.5px solid ${done?C.green:ch.c}25`,transition:'all .3s'}}>
        {done?'✓':ch.emoji}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:9,fontWeight:700,color:ch.c,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>Reto del día</div>
        <div style={{fontSize:13,fontWeight:700,color:C.text,textDecoration:done?'line-through':'none',lineHeight:1.3}}>{ch.text}</div>
      </div>
      <div style={{padding:'4px 9px',borderRadius:10,background:done?`${C.green}15`:`${ch.c}10`,border:`1px solid ${done?C.green:ch.c}20`}}>
        <div style={{fontSize:10,fontWeight:800,color:done?C.green:ch.c}}>{done?'✓ Hecho':ch.reward}</div>
      </div>
    </div>
  );
}


function AIAssistant({C, F, nombre, tot, metas, obj, log, streak, onClose, userAllergens=[], veganMode=false, iaMemoria={gustos:[],disgustos:[],patrones:[]}, onIaMemoriaUpdate=null, isPro=false, meseta=null, onAddFood=null, meal='Desayuno', condicion='ninguna', condiciones=null, perfil={}, agua=0, exercises=[], saludScore=0, nutriPlan=null, botOutfit='chef'}) {
  // Normaliza condiciones a array (soporta múltiples)
  const conds = Array.isArray(condiciones)&&condiciones.length ? condiciones : (condicion&&condicion!=='ninguna'?[condicion]:[]);
  const chatKey = 'nutri_chat_' + new Date().toISOString().split('T')[0];
  const [msgs, setMsgs] = useState(()=>{
    const saved = LS.get(chatKey, []);
    return saved.length > 0 ? saved : [];
  });
  const [showHistorialChat, setShowHistorialChat] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // chat | tips | memoria
  const endRef = useRef(null);

  useEffect(()=>{
    if(msgs.length > 0) LS.set(chatKey, msgs.slice(-20));
  },[msgs]);

  const objLabels={bajar:'bajar de peso',mantener:'mantener peso',recomp:'recomposición corporal',subir:'ganar masa muscular'};
  const actLabels={'1.2':'Sedentario','1.375':'Ligero (1-2 días/sem)','1.55':'Moderado (3-5 días/sem)','1.725':'Activo (6-7 días/sem)','1.9':'Muy activo'};
  const pct = metas.cal>0?Math.round(tot.cal/metas.cal*100):0;
  const imc = perfil.peso&&perfil.altura ? (perfil.peso/((perfil.altura/100)**2)).toFixed(1) : null;
  const imcLabel = imc ? (imc<18.5?'Bajo peso':imc<25?'Normal':imc<30?'Sobrepeso':'Obesidad') : '';
  const totalBurn = (exercises||[]).reduce((s,e)=>s+(e.burn||0),0);
  const todayFoods = log.length>0 ? log.slice(0,10).map(i=>i.nombre).join(', ')+(log.length>10?` y ${log.length-10} más`:'') : 'ninguna aún';

  const systemPrompt = `Eres NutriBot, el asistente personal de Calorú — app chilena de nutrición. Eres cercano, motivador y EXPERTO en nutrición chilena Y en todas las funciones de la app. Actúas como consultor 360: conoces todo del usuario y puedes ayudarlo con nutrición y con el uso de la app.

══ PERFIL COMPLETO DEL USUARIO ══
Nombre: ${nombre} | Objetivo: ${objLabels[obj]||obj} | Racha: ${streak.days} días 🔥
${perfil.peso?`Físico: ${perfil.sexo==='M'?'Hombre':'Mujer'}, ${perfil.edad} años, ${perfil.peso}kg, ${perfil.altura}cm${imc?` | IMC: ${imc} (${imcLabel})`:''}`:''}
${perfil.act?`Actividad: ${actLabels[String(perfil.act)]||perfil.act}`:''}
Condición médica: ${conds.length?conds.join(', '):'Sin condición especial'}
${veganMode?'🌱 Modo vegano activo.':''}
${userAllergens.length>0?`🚫 Alergias: ${userAllergens.join(', ')} — NUNCA sugerir estos.`:''}
${nutriPlan?`👩‍⚕️ Nutricionista: ${nutriPlan.nutricionista_nombre}${nutriPlan.calorias_meta?` (meta: ${nutriPlan.calorias_meta} kcal/día)`:''}`:'Sin nutricionista vinculado.'}
Plan: ${isPro?'Calorú Pro ✨':'Calorú Gratis 🆓'}
Salud Score hoy: ${saludScore}/100

══ RESUMEN DE HOY ══
Calorías: ${Math.round(tot.cal)}/${metas.cal} kcal (${pct}%) — quedan ${Math.max(0,metas.cal-Math.round(tot.cal))} kcal
Prot: ${Math.round(tot.prot)}/${metas.prot}g | Carbs: ${Math.round(tot.carbs)}/${metas.carbs}g | Grasas: ${Math.round(tot.grasas)}/${metas.grasas}g | Azúcar: ${Math.round(tot.azucar||0)}g/25g
Agua: ${agua}/8 vasos | Ejercicio: ${totalBurn>0?`${totalBurn} kcal quemadas (${(exercises||[]).map(e=>e.nombre).join(', ')})`:'Sin ejercicio hoy'}
Comidas (${log.length}): ${todayFoods}
${meseta?'⚠️ Posible meseta detectada — el peso no ha bajado en días.':''}
${conds.includes('diabetes')?'⚠️ DIABETES: bajo IG, sin azúcares simples.':''}${conds.includes('hipertension')?'⚠️ HIPERTENSIÓN: máx 2000mg sodio/día.':''}${conds.includes('colesterol')?'⚠️ COLESTEROL: sin grasas sat/trans.':''}${conds.includes('celiaco')?'⚠️ CELIAQUÍA: sin gluten.':''}
${isPro&&iaMemoria?.gustos?.length>0?`❤️ Le gusta: ${iaMemoria.gustos.join(', ')}.`:''}
${isPro&&iaMemoria?.disgustos?.length>0?`🚫 No le gusta: ${iaMemoria.disgustos.join(', ')}.`:''}

══ FUNCIONES DE CALORÚ (para consultas de la app) ══
• REGISTRO: Busca 475+ alimentos chilenos en Tab ➕. Usa nombre, marca o categoría.
• ESCÁNER DE BARRAS: Botón 📷 en Tab ➕. Escanea el código del producto.
• FOTO IA (Pro): Foto del plato → calorías automáticas. Solo Pro.
• NUTRI IA (yo): Soy yo. Chat de nutrición + ayuda con la app.
• MI DÍA (📋): Resumen del día con gráficos, hidratación, ejercicio, nota personal.
• STATS (📊): Gráficos de evolución semanal/mensual de calorías y peso.
• RACHA 🔥: Registra algo cada día para mantenerla. Se pierde si no registras.
• AGUA: Registro de vasos en el home. Meta: 8 vasos/día.
• EJERCICIO: Agregar en el home. Resta kcal quemadas de tu balance.
• SALUD SCORE: Puntuación 0-100 del día basada en calorías, proteínas, agua y ejercicio.
• METAS: Perfil > Metas. Calcula tu TDEE con tus datos físicos.
• NUTRICIONISTA: Perfil > Ajustes > "Vincular con nutricionista". Ingresa el código NUT-XXXXX.
• ALERGIAS: Perfil > Ajustes > Alergias. Filtra productos automáticamente.
• MODO VEGANO: Perfil > Ajustes. Filtra sugerencias con carne/lácteos.
• PRO ($3.500/mes): Foto IA, Nutri IA ilimitado, micronutrientes, sin límites.
• MODO PROFESIONAL (nutricionistas): Requiere plan Profesional ($9.990/mes). Gestiona pacientes.
• MODO SIN CALORÍAS: Perfil > Ajustes. Muestra semáforos en vez de números.
• TEMA: Auto (oscuro 20:00–07:00), claro u oscuro. Perfil > Ajustes.
• PRODUCTOS COMUNITARIOS: Si no encuentras un alimento, agrégalo para la comunidad.

══ INSTRUCCIONES ══
- Responde en español chileno, breve y amigable (máx 3 párrafos). Emojis con moderación.
- Puedes responder sobre NUTRICIÓN y sobre CÓMO USAR CALORÚ. Eres experto en ambos.
- Si preguntan cómo hacer algo en la app, da pasos claros y específicos.
- Usa marcas chilenas: Soprole, Colún, Nestlé Chile, Carozzi, Fruna, Costa, Super Pollo, Ideal, Lider, Jumbo.
- No redirigir si preguntan sobre la app — eso ES tu área de expertise.
${isPro?'- Cuando detectes gustos/disgustos o patrones, recuérdalos en tu respuesta.':''}

REGISTRAR COMIDAS: Si el usuario menciona que comió algo, incluye AL INICIO de tu respuesta (sin texto previo):
<<<REGISTER_FOOD:{"nombre":"nombre descriptivo","cal":número,"prot":número,"carbs":número,"grasas":número,"fibra":número,"azucar":número,"sodio":número,"emoji":"emoji"}>>>

PORCIONES TÍPICAS CHILENAS:
• Marraqueta (1): cal:210,prot:7,carbs:40,grasas:2,fibra:2,azucar:1,sodio:400
• Empanada pino horneada: cal:350,prot:14,carbs:35,grasas:16,fibra:2,azucar:2,sodio:580
• Completo italiano: cal:480,prot:18,carbs:42,grasas:26,fibra:3,azucar:5,sodio:850
• Cazuela de pollo: cal:300,prot:28,carbs:22,grasas:8,fibra:3,azucar:2,sodio:650
• Pechuga pollo plancha 150g: cal:230,prot:43,carbs:0,grasas:5,fibra:0,azucar:0,sodio:90
• Chorrillana: cal:900,prot:30,carbs:60,grasas:55,fibra:4,azucar:5,sodio:1200
• Arroz con pollo: cal:520,prot:32,carbs:55,grasas:14,fibra:2,azucar:1,sodio:700
• Salmón plancha (filete): cal:290,prot:36,carbs:0,grasas:15,fibra:0,azucar:0,sodio:95
• Manzana mediana: cal:80,prot:0,carbs:21,grasas:0,fibra:4,azucar:16,sodio:2
Ajusta al tamaño. Nombre descriptivo ("Empanada de pino horneada", "Arroz con pollo casero").`;

  const QUICK_PROMPTS = [
    {icon:'📊', text:'¿Cómo voy hoy?'},
    {icon:'🍽️', text:'¿Qué debería comer ahora?'},
    {icon:'💪', text:'¿Cómo llego a mi meta de proteínas?'},
    {icon:'📱', text:'¿Cómo uso el escáner de código?'},
    {icon:'🔥', text:'¿Cómo no perder mi racha?'},
    {icon:'⭐', text:'¿Qué incluye Calorú Pro?'},
    {icon:'🇨🇱', text:'Sugiéreme un almuerzo chileno'},
    {icon:'🌙', text:'¿Qué puedo cenar liviano?'},
  ];

  useEffect(()=>{
    if(msgs.length===0){
      const kcalRestantes = Math.max(0, metas.cal - Math.round(tot.cal));
      const saludo = saludScore>=70?'¡Vas muy bien hoy! 💪':saludScore>=40?'Buen inicio del día 🌱':'¡Empecemos juntos hoy! ☀️';
      setMsgs([{role:'assistant',content:`¡Hola ${nombre}! Soy NutriBot, tu asistente personal de Calorú 🤖\n\n${saludo} Llevas **${Math.round(tot.cal)} kcal** (${pct}% de tu meta) y te quedan **${kcalRestantes} kcal** hoy.\n\nPuedo ayudarte con nutrición, consejos personalizados y cualquier duda sobre la app. ¿Qué necesitas?`}]);
    }
  },[]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:'smooth'});
  },[msgs]);

  const parseAndRegisterFood = (reply) => {
    const match = reply.match(/<<<REGISTER_FOOD:({[\s\S]*?})>>>/);
    if(match && onAddFood) {
      try {
        const food = JSON.parse(match[1]);
        const clamp = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));
        onAddFood({
          id: Math.abs([...(food.nombre||'')].reduce((h,c)=>Math.imul(31,h)+c.charCodeAt(0)|0,0))||Date.now(),
          nombre: String(food.nombre || 'Alimento registrado').slice(0, 120),
          marca: 'Nutri IA',
          cat: 'Preparados',
          porcion: 100,
          cal:    clamp(food.cal,    0, 5000),
          prot:   clamp(food.prot,   0,  500),
          carbs:  clamp(food.carbs,  0,  500),
          grasas: clamp(food.grasas, 0,  300),
          fibra:  clamp(food.fibra,  0,  100),
          azucar: clamp(food.azucar, 0,  300),
          sodio:  clamp(food.sodio,  0, 5000),
          emoji: food.emoji || '🍽️',
          comida: meal,
        });
      } catch(err) { console.error('Error parsing food register:', err); }
    }
    // Remove the JSON tag from the displayed message
    return reply.replace(/<<<REGISTER_FOOD:[\s\S]*?>>>\n?/g, '').trim();
  };

  const send = async(text) => {
    const userText = text || input.trim();
    if(!userText || loading) return;
    setInput('');
    setLoading(true);

    const newMsgs = [...msgs, {role:'user', content:userText}];
    setMsgs(newMsgs);

    try {
      const data = await callEdgeFn({
        mode: 'chat',
        system: systemPrompt,
        messages: newMsgs.map(m=>({role:m.role, content:m.content})),
      });
      const rawReply = data.text || 'No pude responder. Intenta de nuevo.';
      const reply = parseAndRegisterFood(rawReply);
      setMsgs(prev=>[...prev, {role:'assistant', content:reply}]);
    } catch(e) {
      setMsgs(prev=>[...prev, {role:'assistant', content:'❌ Error de conexión. Verifica tu internet.'}]);
    }
    setLoading(false);
  };

  const renderText = (text) => {
    // Simple markdown: **bold**
    return text.split('**').map((part,i)=>
      i%2===1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:88,display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{...modalHeaderStyle(C), gap:12}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:10}}>
          <NutriBot state={loading?'thinking':'idle'} size={44} outfit={botOutfit}/>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>Nutri IA</div>
            <div style={{fontSize:10,color:loading?'#FF9500':'#34C759',fontWeight:600,transition:'color .3s'}}>{loading?'⚡ Pensando...':'● En línea'}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',padding:'8px 16px 0',gap:4,borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        {(isPro?['chat','tips','memoria']:['chat','tips']).map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            padding:'7px 14px',borderRadius:'10px 10px 0 0',border:'none',cursor:'pointer',
            background:mode===m?C.bg:'transparent',
            color:mode===m?C.text:C.textSec,
            fontSize:12,fontWeight:mode===m?800:500,fontFamily:F,
            borderBottom:mode===m?`2px solid #D42020`:'2px solid transparent',
          }}>
            {m==='chat'?'💬 Chat':m==='tips'?'💡 Consejos':'🧠 Memoria'}
          </button>
        ))}
      </div>

      {/* Pestaña Memoria */}
      {mode==='memoria'&&isPro&&(
        <div style={{flex:1,overflowY:'auto',padding:16}}>
          <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>🧠 Lo que Nutri recuerda de ti</div>
            <div style={{fontSize:11,color:C.textSec}}>La IA aprende tus preferencias para darte mejores consejos personalizados.</div>
          </div>
          {/* Gustos */}
          <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:'#34C759',marginBottom:8}}>❤️ Le gusta</div>
            {iaMemoria.gustos?.length>0 ? iaMemoria.gustos.map((g,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<iaMemoria.gustos.length-1?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:13,color:C.text}}>{g}</span>
                <button onClick={()=>onIaMemoriaUpdate&&onIaMemoriaUpdate(prev=>({...prev,gustos:prev.gustos.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',cursor:'pointer',color:'#FF3B30',fontSize:16}}>×</button>
              </div>
            )) : <div style={{fontSize:12,color:C.textMuted}}>Aún no hay registros. Cuéntale a Nutri qué te gusta.</div>}
          </div>
          {/* Disgustos */}
          <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:'#FF3B30',marginBottom:8}}>🚫 No le gusta</div>
            {iaMemoria.disgustos?.length>0 ? iaMemoria.disgustos.map((g,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<iaMemoria.disgustos.length-1?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:13,color:C.text}}>{g}</span>
                <button onClick={()=>onIaMemoriaUpdate&&onIaMemoriaUpdate(prev=>({...prev,disgustos:prev.disgustos.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',cursor:'pointer',color:'#FF3B30',fontSize:16}}>×</button>
              </div>
            )) : <div style={{fontSize:12,color:C.textMuted}}>Aún no hay registros.</div>}
          </div>
          {/* Agregar manualmente */}
          <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>➕ Agregar preferencia</div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input id="mem-input" placeholder="Ej: pollo, brócoli..." style={{flex:1,padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:12,fontFamily:F,outline:'none'}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>{const v=document.getElementById('mem-input')?.value?.trim();if(v&&onIaMemoriaUpdate){onIaMemoriaUpdate(prev=>({...prev,gustos:[...(prev.gustos||[]),v]}));document.getElementById('mem-input').value='';}}} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:'#34C75920',color:'#34C759',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>❤️ Me gusta</button>
              <button onClick={()=>{const v=document.getElementById('mem-input')?.value?.trim();if(v&&onIaMemoriaUpdate){onIaMemoriaUpdate(prev=>({...prev,disgustos:[...(prev.disgustos||[]),v]}));document.getElementById('mem-input').value='';}}} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:'#FF3B3020',color:'#FF3B30',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>🚫 No me gusta</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {(mode==='chat'||mode==='tips')&&<div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            {m.role==='assistant'&&(
              <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#D42020,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,marginRight:8,alignSelf:'flex-end'}}>🤖</div>
            )}
            <div style={{
              maxWidth:'80%',padding:'10px 14px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
              background:m.role==='user'?'#D42020':C.surface,
              color:m.role==='user'?'white':C.text,
              fontSize:13,lineHeight:1.5,
              border:m.role==='assistant'?`1px solid ${C.border}`:'none',
            }}>
              {renderText(m.content)}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
            <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#D42020,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:'18px 18px 18px 4px',padding:'12px 16px',display:'flex',gap:5}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:'50%',background:C.textMuted,animation:`bounce .8s ease ${i*0.15}s infinite`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>}

      {/* Quick prompts */}
      {msgs.length <= 2&&(
        <div style={{padding:'0 16px 8px',display:'flex',gap:6,overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
          {QUICK_PROMPTS.map(({icon,text})=>(
            <button key={text} className="tap" onClick={()=>send(text)} style={{
              flexShrink:0,padding:'8px 12px',borderRadius:14,
              border:`1px solid ${C.border}`,background:C.surfaceAlt,
              color:C.text,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap',
            }}><span>{icon}</span>{text}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,padding:'10px 16px 28px',display:'flex',gap:8,flexShrink:0}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
          placeholder="Pregunta sobre nutrición..."
          style={{flex:1,padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:16,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}
        />
        <button className="tap" onClick={()=>send()} disabled={!input.trim()||loading} style={{
          width:44,height:44,borderRadius:14,border:'none',
          background:input.trim()&&!loading?'#D42020':'#C7C7CC',
          color:'white',fontSize:18,cursor:'pointer',flexShrink:0,
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>↑</button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   ESTIMADOR RÁPIDO — comida sin etiqueta
═══════════════════════════════════════════════════════ */
const QUICK_ESTIMATES = [
  {cat:'🍗 Proteínas',items:[
    {n:'Pechuga de pollo a la plancha',cal:165,prot:33,carbs:0,grasas:3.5},
    {n:'Filete de vacuno a la parrilla',cal:230,prot:36,carbs:0,grasas:9},
    {n:'Salmón al horno',cal:290,prot:29,carbs:0,grasas:18},
    {n:'Huevo frito',cal:90,prot:6,carbs:0,grasas:7},
    {n:'Hamburguesa casera',cal:380,prot:26,carbs:2,grasas:30},
  ]},
  {cat:'🍚 Carbos',items:[
    {n:'Arroz cocido (1 taza)',cal:200,prot:4,carbs:43,grasas:0.5},
    {n:'Pasta cocida (1 taza)',cal:220,prot:7,carbs:44,grasas:1},
    {n:'Papa cocida mediana',cal:130,prot:3,carbs:30,grasas:0.1},
    {n:'Pan marraqueta',cal:230,prot:7,carbs:44,grasas:2.5},
  ]},
  {cat:'🥗 Ensaladas',items:[
    {n:'Ensalada mixta simple',cal:45,prot:2,carbs:8,grasas:0.5},
    {n:'Ensalada con aderezo',cal:120,prot:2,carbs:9,grasas:8},
    {n:'Ensalada César con pollo',cal:380,prot:28,carbs:18,grasas:22},
  ]},
  {cat:'🇨🇱 Chileno',items:[
    {n:'Cazuela de pollo',cal:265,prot:22,carbs:28,grasas:7},
    {n:'Completo italiano',cal:480,prot:15,carbs:45,grasas:26},
    {n:'Empanada de pino',cal:360,prot:14,carbs:38,grasas:16},
    {n:'Sopaipilla',cal:198,prot:3.5,carbs:28,grasas:8},
    {n:'Churrasco con todo',cal:650,prot:35,carbs:52,grasas:30},
  ]},
  {cat:'☕ Bebidas',items:[
    {n:'Café con leche',cal:90,prot:4,carbs:9,grasas:3.5},
    {n:'Jugo de naranja natural',cal:110,prot:1.5,carbs:26,grasas:0},
    {n:'Cerveza lata 350ml',cal:150,prot:1.5,carbs:14,grasas:0},
    {n:'Bebida cola lata 350ml',cal:148,prot:0,carbs:37,grasas:0},
  ]},
];

function RestaurantEstimator({C,F,meal,onAdd,onClose,accent}){
  const [tab,setTab]   = useState(0);
  const [size,setSize] = useState('medium');
  const mult = {small:.65,medium:1,large:1.4,xlarge:1.8}[size];

  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:65,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:'100%',background:C.surface,borderRadius:'24px 24px 0 0',padding:'16px 16px 40px',maxHeight:'88vh',overflowY:'auto',animation:'slideUp .3s ease'}}>
        <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:'0 auto 14px'}}/>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>🍽️ Estimador rápido</div>
        <div style={{fontSize:11,color:C.textSec,marginBottom:12}}>Para cuando comes fuera y no hay etiqueta</div>
        {/* Size */}
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {[{k:'small',l:'S'},{k:'medium',l:'M'},{k:'large',l:'L'},{k:'xlarge',l:'XL'}].map(({k,l})=>(
            <button key={k} className="tap" onClick={()=>setSize(k)} style={{flex:1,padding:'8px 4px',borderRadius:12,border:`1.5px solid ${size===k?'#D42020':C.border}`,background:size===k?'#D4202018':C.surfaceAlt,color:size===k?'#D42020':C.textSec,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              {l}
            </button>
          ))}
        </div>
        {/* Category tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:12,overflowX:'auto',scrollbarWidth:'none'}}>
          {QUICK_ESTIMATES.map((cat,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:'7px 12px',border:'none',background:'none',cursor:'pointer',fontFamily:F,fontSize:11,fontWeight:700,color:tab===i?accent:C.textSec,borderBottom:`2px solid ${tab===i?accent:'transparent'}`,whiteSpace:'nowrap'}}>
              {cat.cat}
            </button>
          ))}
        </div>
        {/* Items */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {QUICK_ESTIMATES[tab].items.map((item,i)=>{
            const cal=Math.round(item.cal*mult);
            return(
              <div key={i} className="tap" onClick={()=>{
                onAdd({id:Date.now()+i,nombre:item.n+(size!=='medium'?` (${size})`:``),marca:'Estimado',cat:'Preparados',porcion:100,cal,prot:Math.round(item.prot*mult*10)/10,carbs:Math.round(item.carbs*mult*10)/10,grasas:Math.round(item.grasas*mult*10)/10,fibra:0,emoji:'🍽️'});
                haptic('add');
              }} style={{display:'flex',alignItems:'center',gap:12,background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',cursor:'pointer',border:`1px solid ${C.border}`}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.n}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>porción {size==='small'?'pequeña':size==='large'?'grande':size==='xlarge'?'extra grande':'normal'}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:'#D42020'}}>{cal}</div>
                  <div style={{fontSize:9,color:C.textMuted}}>kcal</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   ENTRADA MANUAL DE PRODUCTO (desde escáner)
═══════════════════════════════════════════════════════ */
function ManualEntry({C, F, barcode, onSave, onBack, supabaseUser}) {
  const [food, setFood] = useState({
    nombre:'', marca:'', porcion:100,
    cal:'', prot:'', carbs:'', grasas:'', fibra:'', azucar:'', sodio:'',
  });
  const [compartir, setCompartir] = useState(true);
  const [sharing, setSharing] = useState(false);
  const valid = food.nombre.trim().length>0 && +food.cal>0;

  // Detecta si los valores parecen ingresados por 100g en vez de por porción
  const porcion = +food.porcion || 100;
  const calPorGramo = +food.cal / porcion;
  const suspiciousData = +food.cal > 0 && porcion < 80 && calPorGramo > 3.5;
  // Ej: 311 kcal / 16g = 19.4 kcal/g → imposible. Máximo real: grasa pura ~9 kcal/g

  const handleSave = async () => {
    if(!valid) return;
    const product = {
      id:Date.now()+Math.random(),
      nombre:food.nombre.trim(),
      marca:food.marca.trim()||'Manual',
      cat:'Escaneado', porcion:+food.porcion||100,
      cal:+food.cal, prot:+food.prot||0, carbs:+food.carbs||0,
      grasas:+food.grasas||0, fibra:+food.fibra||0,
      azucar:food.azucar!==''?+food.azucar:null,
      sodio:food.sodio!==''?+food.sodio:null,
      emoji:'📦', barcode,
    };
    // Guardar en DB comunitaria si el usuario quiere compartir
    if(compartir && barcode && supabaseUser) {
      setSharing(true);
      try {
        await supabase.from('community_products').upsert({
          barcode: String(barcode),
          nombre: product.nombre,
          marca: product.marca,
          porcion: product.porcion,
          cal: product.cal,
          prot: product.prot,
          carbs: product.carbs,
          grasas: product.grasas,
          fibra: product.fibra,
          azucar: product.azucar,
          sodio: product.sodio,
          emoji: product.emoji,
          cat: product.cat,
          contributed_by: supabaseUser.id,
        }, { onConflict: 'barcode', ignoreDuplicates: true });
      } catch { /* si falla el compartir, igual agrega al diario */ }
      setSharing(false);
    }
    onSave(product);
  };

  return(
    <div style={{padding:'8px 0',animation:'fadeUp .25s ease'}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>✏️ Agregar manualmente</div>
      {barcode&&<div style={{fontSize:11,color:C.textMuted,marginBottom:8,padding:'4px 10px',background:C.surfaceAlt,borderRadius:8,display:'inline-block'}}>📷 Código: {barcode}</div>}

      {/* Aviso importante: valores por porción */}
      <div style={{background:'rgba(255,149,0,0.1)',border:'1px solid rgba(255,149,0,0.3)',borderRadius:12,padding:'8px 12px',marginBottom:10,display:'flex',gap:8,alignItems:'flex-start'}}>
        <span style={{fontSize:15,flexShrink:0}}>📋</span>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#FF9500'}}>Ingresa los valores POR PORCIÓN</div>
          <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>Copia los datos tal como aparecen en la etiqueta del producto, según el tamaño de porción indicado. No por 100g.</div>
        </div>
      </div>

      {/* Advertencia de datos sospechosos */}
      {suspiciousData && (
        <div style={{background:'rgba(255,59,48,0.1)',border:'1px solid rgba(255,59,48,0.3)',borderRadius:12,padding:'8px 12px',marginBottom:10,display:'flex',gap:8,alignItems:'flex-start'}}>
          <span style={{fontSize:15,flexShrink:0}}>⚠️</span>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#FF3B30'}}>Los valores parecen muy altos para {porcion}g</div>
            <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>¿Ingresaste las calorías por 100g en vez de por {porcion}g? Revisa la etiqueta y ajusta la porción o los valores.</div>
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        <div style={{gridColumn:'1/-1'}}>
          <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:4}}>Nombre *</div>
          <input value={food.nombre} onChange={e=>setFood({...food,nombre:e.target.value})}
            placeholder="Ej: Galletas de avena"
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${food.nombre?'#D42020':C.border}`,borderRadius:12,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
        </div>
        <div style={{gridColumn:'1/-1'}}>
          <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:4}}>Marca</div>
          <input value={food.marca} onChange={e=>setFood({...food,marca:e.target.value})}
            placeholder="Ej: Nestlé"
            style={{width:'100%',padding:'10px 12px',border:`1px solid ${C.border}`,borderRadius:12,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
        </div>
        {[
          {l:'Porción (g)',k:'porcion',req:false},
          {l:'Calorías *', k:'cal',    req:true},
          {l:'Proteínas', k:'prot',    req:false},
          {l:'Carbos',    k:'carbs',   req:false},
          {l:'Grasas',    k:'grasas',  req:false},
          {l:'Fibra',     k:'fibra',   req:false},
          {l:'Azúcar',    k:'azucar',  req:false},
          {l:'Sodio (mg)',k:'sodio',   req:false},
        ].map(({l,k,req})=>(
          <div key={k}>
            <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:4}}>{l}</div>
            <input type="number" min="0" value={food[k]}
              onChange={e=>setFood({...food,[k]:e.target.value})}
              onFocus={e=>e.target.select()}
              placeholder="0"
              style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${req&&!food[k]?C.border:food[k]?'#D42020':C.border}`,borderRadius:12,fontSize:15,fontWeight:700,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          </div>
        ))}
      </div>

      {/* Toggle compartir con la comunidad */}
      {barcode && supabaseUser && (
        <button onClick={()=>setCompartir(v=>!v)} style={{
          width:'100%',marginBottom:10,padding:'10px 14px',borderRadius:14,
          border:`1.5px solid ${compartir?'#34C759':'rgba(120,120,128,0.3)'}`,
          background:compartir?'rgba(52,199,89,0.08)':'transparent',
          display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontFamily:F,
        }}>
          <span style={{fontSize:18}}>{compartir?'🌎':'🔒'}</span>
          <div style={{flex:1,textAlign:'left'}}>
            <div style={{fontSize:12,fontWeight:700,color:compartir?'#34C759':C.textSec}}>
              {compartir?'Compartir con la comunidad Calorú':'Solo para mí'}
            </div>
            <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>
              {compartir?'Otros usuarios podrán encontrar este producto al escanearlo':'El producto se guardará solo en tu dispositivo'}
            </div>
          </div>
          <div style={{
            width:22,height:22,borderRadius:11,border:`2px solid ${compartir?'#34C759':'#C7C7CC'}`,
            background:compartir?'#34C759':'transparent',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
          }}>
            {compartir&&<span style={{color:'white',fontSize:12,fontWeight:800}}>✓</span>}
          </div>
        </button>
      )}

      <div style={{display:'flex',gap:8}}>
        <button className="tap" onClick={onBack} style={{flex:1,padding:'12px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>← Volver</button>
        <button className="tap" onClick={handleSave} disabled={sharing} style={{flex:2,padding:'12px',borderRadius:16,border:'none',background:valid?'#D42020':'#C7C7CC',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
          {sharing?'📤 Compartiendo…':'✅ Agregar al diario'}
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   RETO 21 DÍAS
═══════════════════════════════════════════════════════ */
function Challenge21({C, F, streak, log, metas, onClose}) {
  const stored   = LS.get('challenge21', null);
  const [active, setActive] = useState(!!stored?.startDate);
  const [startDate, setStartDate] = useState(stored?.startDate||null);

  const start = () => {
    const sd = todayKey();
    LS.set('challenge21', {startDate:sd, completedDays:[]});
    setStartDate(sd); setActive(true); haptic('goal');
  };
  const reset = () => { LS.set('challenge21',null); setActive(false); setStartDate(null); };

  const days = active ? Array.from({length:21},(_,i)=>{
    const [sy,sm,sd] = startDate.split('-').map(Number);
    const d = new Date(sy, sm-1, sd);
    d.setDate(d.getDate()+i);
    const key = dateToKey(d);
    const today = todayKey();
    const dayLog = LS.get('log_'+key,[]);
    const s = dayLog.length>0 ? {cal:sumLog(dayLog).cal} : null;
    return {
      key, n:i+1,
      done: s && s.cal >= metas.cal*0.7,
      isToday: key===today,
      isPast: key<today,
      isFuture: key>today,
      cal: s?.cal||0,
    };
  }) : [];

  const completed = days.filter(d=>d.done).length;
  const pct = active ? Math.round(completed/21*100) : 0;
  const isFinished = active && days.length===21 && days[20].isPast;

  return(
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:85,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      <div style={modalHeaderStyle(C)}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>🏆 Reto 21 Días</div>
        {active
          ?<button onClick={reset} style={{...backBtnStyle(C),color:'#FF3B30',fontSize:11,minWidth:64}}>Reiniciar</button>
          :<div style={{minWidth:80}}/>
        }
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {!active?(
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:60,marginBottom:16}}>🏆</div>
            <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>Reto 21 Días</div>
            <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:24,maxWidth:280,margin:'0 auto 24px'}}>
              Registra tus comidas durante 21 días seguidos y construye el hábito de por vida. La ciencia dice que 21 días son suficientes para crear un hábito nuevo.
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:28}}>
              {[{icon:'📅',l:'21 días','sub':'de registro'},
                {icon:'🎯',l:'70%',sub:'meta calórica'},
                {icon:'🏅',l:'Badge',sub:'exclusivo'}].map(({icon,l,sub})=>(
                <div key={l} style={{background:C.surface,borderRadius:16,padding:'14px 8px',border:`1px solid ${C.border}`,textAlign:'center'}}>
                  <div style={{fontSize:26,marginBottom:6}}>{icon}</div>
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>{l}</div>
                  <div style={{fontSize:10,color:C.textSec}}>{sub}</div>
                </div>
              ))}
            </div>
            <button className="tap" onClick={start} style={{padding:'16px 40px',borderRadius:20,border:'none',background:'linear-gradient(135deg,#FF9500,#FF6B00)',color:'white',fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:F,boxShadow:'0 8px 24px rgba(255,149,0,0.4)'}}>
              🚀 ¡Comenzar el reto!
            </button>
          </div>
        ):(
          <>
            {/* Progress */}
            <div style={{background:'linear-gradient(145deg,#1A1A2E,#16213E)',borderRadius:24,padding:'20px',marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',fontWeight:600}}>Progreso</div>
                  <div style={{fontSize:32,fontWeight:800,color:'white',lineHeight:1}}>{completed}<span style={{fontSize:16,color:'rgba(255,255,255,0.4)'}}>/21</span></div>
                </div>
                <div style={{width:72,height:72,borderRadius:'50%',background:`conic-gradient(#FF9500 ${pct*3.6}deg,rgba(255,255,255,0.08) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:56,height:56,borderRadius:'50%',background:'#1A1A2E',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'white'}}>{pct}%</div>
                  </div>
                </div>
              </div>
              <div style={{height:6,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#FF9500,#FF6B00)',borderRadius:3,transition:'width .5s ease'}}/>
              </div>
              {isFinished&&completed>=18&&(
                <div style={{marginTop:14,textAlign:'center',padding:'12px',background:'rgba(255,149,0,0.15)',borderRadius:14,border:'1px solid rgba(255,149,0,0.3)'}}>
                  <div style={{fontSize:24,marginBottom:4}}>🏆</div>
                  <div style={{fontSize:14,fontWeight:800,color:'#FF9500'}}>¡Reto completado!</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginTop:2}}>Completaste {completed} de 21 días. ¡Increíble!</div>
                </div>
              )}
            </div>

            {/* Day grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:7}}>
              {days.map(d=>(
                <div key={d.key} style={{
                  borderRadius:14,padding:'8px 4px',textAlign:'center',
                  background:d.done?'linear-gradient(135deg,#FF9500,#FF6B00)':
                    d.isToday?C.surface:
                    d.isPast?C.surfaceAlt:'transparent',
                  border:`1.5px solid ${d.done?'transparent':d.isToday?'#FF9500':C.border}`,
                  opacity:d.isFuture?0.4:1,
                }}>
                  <div style={{fontSize:d.done?16:18,marginBottom:2}}>{d.done?'✅':d.isToday?'⭐':d.isPast?'○':'·'}</div>
                  <div style={{fontSize:10,fontWeight:700,color:d.done?'white':d.isToday?'#FF9500':C.textMuted}}>{d.n}</div>
                </div>
              ))}
            </div>

            <div style={{marginTop:14,padding:'12px 14px',background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,fontSize:11,color:C.textSec,lineHeight:1.6}}>
              💡 <strong style={{color:C.text}}>Cuenta un día</strong> si registras comidas que sumen al menos el 70% de tu meta calórica.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SELLOS OCTAGONALES MINSAL — Fase 3 (vigente desde 2019)
   Umbrales por 100g (sólidos) o 100ml (líquidos)
═══════════════════════════════════════════════════════ */
const SELLOS_CONFIG = [
  { key:'cal',    label:'CALORÍAS', solidT:275,  liquidT:70,  field:'cal'    },
  { key:'azucar', label:'AZÚCARES', solidT:22.5, liquidT:6,   field:'azucar' },
  { key:'sodio',  label:'SODIO',    solidT:400,  liquidT:100, field:'sodio'  },
];
const calcSellos = (food) => {
  const p = food.porcion || 100;
  const liquid = food.cat === 'Bebidas';
  return SELLOS_CONFIG.filter(s => {
    const val = food[s.field];
    if(val == null) return false;
    const per100 = (val / p) * 100;
    return per100 >= (liquid ? s.liquidT : s.solidT);
  });
};

/* ═══════════════════════════════════════════════════════
   MODAL DETALLE CON AJUSTE DE GRAMOS
═══════════════════════════════════════════════════════ */
function ModalDetalle({food, meal, C, F, onClose, onAdd, onFav, isFav}) {
  const [grams, setGrams] = useState(food.porcion || 100);
  const [mode, setMode] = useState(()=>LS.get('prefMode','porcion')); // 'porcion' | 'gramos'

  useEffect(()=>{ setGrams(food.porcion||100); setMode('porcion'); },[food.id]);

  const sellos = useMemo(()=>calcSellos(food),[food.id]);
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
            <button key={v} onClick={()=>{setMode(v);LS.set('prefMode',v);if(v==='porcion')setGrams(food.porcion||100);}} style={{
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
                  border:`1.5px solid ${grams===g?'#D42020':C.border}`,
                  background:grams===g?'#D4202014':C.surfaceAlt,
                  color:grams===g?'#D42020':C.textSec,
                  fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
                  transition:'all .15s',textAlign:'center',
                }}>{g}g</button>
              ))}
            </div>
            {/* Portion equivalence hint */}
            {getPortionHint(grams)&&(
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,padding:'6px 10px',background:'#D4202010',borderRadius:10,border:'1px solid #D4202020'}}>
                <span style={{fontSize:14}}>⚖️</span>
                <span style={{fontSize:12,color:'#D42020',fontWeight:700}}>≈ {getPortionHint(grams)}</span>
                <span style={{fontSize:11,color:C.textMuted}}>en volumen</span>
              </div>
            )}

            {/* Portion reference chips */}
            <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
              {PORTION_REFS.slice(0,8).map(r=>(
                <button key={r.g} className="tap" onClick={()=>setGrams(r.g)} style={{
                  padding:'4px 9px',borderRadius:9,
                  border:`1px solid ${Math.abs(grams-r.g)<=2?'#D42020':C.border}`,
                  background:Math.abs(grams-r.g)<=2?'#D42020':C.surfaceAlt,
                  color:Math.abs(grams-r.g)<=2?'white':C.textSec,
                  fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:F,
                }}>{r.l}</button>
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
              <button onClick={()=>setGrams(grams+5)} style={{width:38,height:38,borderRadius:11,border:'none',background:'#D42020',fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
            </div>
          </div>
        )}

        {/* Vegan indicator */}
        {isVegan(food)
          ? <div style={{background:'#34C75912',borderRadius:14,padding:'10px 14px',marginBottom:10,border:'1px solid #34C75930'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>🌱</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#34C759'}}>Producto vegano</div>
                  {food.vegan===true&&food.offLabels?.includes('en:vegan')
                    ?<div style={{fontSize:10,color:'#34C759',opacity:.7,marginTop:1}}>Certificado vegano en OpenFoodFacts</div>
                    :food.vegan===true&&food.ingredients
                      ?<div style={{fontSize:10,color:'#34C759',opacity:.7,marginTop:1}}>Sin ingredientes de origen animal detectados</div>
                      :<div style={{fontSize:10,color:'#34C759',opacity:.7,marginTop:1}}>Sin ingredientes de origen animal en nuestra base</div>
                  }
                </div>
              </div>
              {food.ingredients&&<div style={{marginTop:8,fontSize:10,color:'#34C759',opacity:.6,lineHeight:1.4,fontStyle:'italic'}}>Ingredientes: {food.ingredients.slice(0,120)}{food.ingredients.length>120?'…':''}</div>}
            </div>
          : <div style={{background:'#FF3B3010',borderRadius:14,padding:'10px 14px',marginBottom:10,border:'1px solid #FF3B3028'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>🚫</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#FF3B30'}}>No vegano</div>
                  {food.vegan===false&&food.ingredients
                    ?<div style={{fontSize:10,color:'#FF3B30',opacity:.7,marginTop:1}}>Ingredientes de origen animal detectados</div>
                    :<div style={{fontSize:10,color:'#FF3B30',opacity:.7,marginTop:1}}>Contiene ingredientes de origen animal</div>
                  }
                </div>
              </div>
              {food.ingredients&&<div style={{marginTop:8,fontSize:10,color:'#FF3B30',opacity:.6,lineHeight:1.4,fontStyle:'italic'}}>Ingredientes: {food.ingredients.slice(0,120)}{food.ingredients.length>120?'…':''}</div>}
            </div>
        }

        {/* Allergen warning */}
        {(getFoodAllergens(food).length>0||food.traceAllergens?.length>0)&&(
          <div style={{background:'#FF950018',borderRadius:14,padding:'10px 14px',marginBottom:14,border:'1px solid #FF950040'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
              <div style={{flex:1}}>
                {getFoodAllergens(food).length>0&&(
                  <>
                    <div style={{fontSize:12,fontWeight:700,color:'#FF9500',marginBottom:6}}>
                      Contiene alérgenos
                      {(food.detectedAllergens?.length>0)&&<span style={{fontSize:9,color:'#FF9500',opacity:.6,fontWeight:500,marginLeft:6}}>detectado desde ingredientes</span>}
                    </div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:food.traceAllergens?.length>0?8:0}}>
                      {getFoodAllergens(food).map(al=>{
                        const info=ALLERGENS.find(x=>x.k===al);
                        if(!info) return null;
                        return <span key={al} style={{fontSize:10,fontWeight:700,color:info.color,background:info.color+'18',padding:'2px 8px',borderRadius:8,border:`1px solid ${info.color}30`}}>{info.icon} {info.label}</span>;
                      })}
                    </div>
                  </>
                )}
                {food.traceAllergens?.length>0&&(
                  <>
                    <div style={{fontSize:11,fontWeight:600,color:'#FF9500',opacity:.7,marginBottom:4}}>Puede contener trazas de</div>
                    <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                      {food.traceAllergens.map(al=>{
                        const info=ALLERGENS.find(x=>x.k===al);
                        if(!info) return null;
                        return <span key={al} style={{fontSize:10,fontWeight:600,color:info.color,background:info.color+'10',padding:'2px 8px',borderRadius:8,border:`1px dashed ${info.color}40`}}>{info.icon} {info.label}</span>;
                      })}
                    </div>
                  </>
                )}
              </div>
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
            ...(food.azucar!=null?[{l:'Azúcar',val:Math.round((food.azucar||0)*((grams||food.porcion||100)/(food.porcion||100))*10)/10,c:'#FF6B6B',unit:'g'}]:[]),
            ...(food.sodio!=null?[{l:'Sodio', val:Math.round((food.sodio||0)*((grams||food.porcion||100)/(food.porcion||100))),c:'#8E8E93',unit:'mg'}]:[]),
          ].map(({l,val,c,unit})=>(
            <div key={l} style={{background:C.surfaceAlt,borderRadius:14,padding:'12px 4px',textAlign:'center',border:`1.5px solid ${C.border}`}}>
              <div style={{fontSize:16,fontWeight:800,color:c,lineHeight:1}}>{val}{unit}</div>
              <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:'uppercase',marginTop:3,letterSpacing:.4}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Sellos octagonales MINSAL */}
        {sellos.length > 0 && (
          <div style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <span style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:.8}}>Sellos MINSAL</span>
              <span style={{fontSize:9,color:C.textMuted,opacity:.7}}>— por 100g/ml del producto</span>
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {sellos.map(s=>(
                <div key={s.key} style={{
                  width:72,height:72,
                  background:'#1C1C1E',
                  clipPath:'polygon(29% 0%,71% 0%,100% 29%,100% 71%,71% 100%,29% 100%,0% 71%,0% 29%)',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,
                }}>
                  <span style={{fontSize:7,fontWeight:700,color:'white',letterSpacing:.4,lineHeight:1}}>ALTO EN</span>
                  <span style={{fontSize:s.label.length>6?8.5:10,fontWeight:800,color:'white',letterSpacing:.2,textAlign:'center',lineHeight:1.2,maxWidth:54,paddingTop:1}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gram info banner with equivalences */}
        <div style={{background:'#D4202010',borderRadius:13,padding:'10px 14px',marginBottom:16,border:'1px solid #D4202020'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:getPortionHint(grams)?5:0}}>
            <span style={{fontSize:12,color:C.textSec,fontWeight:600}}>
              {mode==='porcion'?`1 porción = ${food.porcion||100}g`:`${grams}g seleccionados`}
            </span>
            <span style={{fontSize:13,fontWeight:800,color:'#D42020'}}>{v(food.cal)} kcal</span>
          </div>
          {getPortionHint(grams)&&(
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:11,color:'#D42020',fontWeight:700}}>≈ {getPortionHint(grams)}</span>
              <span style={{fontSize:10,color:C.textMuted}}>en volumen</span>
            </div>
          )}
        </div>

        <button onClick={()=>{onAdd({...food, grams: mode==='gramos'?grams:null}); haptic('add');}} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:'#D42020',
          color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
        }}>Agregar {grams}g a {meal}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   AUTH SCREEN
═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   LEGAL MODAL — Política de privacidad + Términos
═══════════════════════════════════════════════════════ */
function LegalModal({ type, onClose }) {
  const F = "'SF Pro Display','Helvetica Neue',sans-serif";
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? '🔒 Política de Privacidad' : '📋 Términos de Servicio';

  const privacy = `Calorú («la app») es desarrollada por Mitchael Erling, con domicilio en Chile.

DATOS QUE RECOPILAMOS
• Datos de cuenta: email y contraseña (gestionados por Supabase Auth con cifrado).
• Datos de salud: peso corporal, historial de peso, medidas, objetivos calóricos y registros de alimentación que tú mismo ingresas voluntariamente.
• Condición médica: si lo indicas, guardamos condiciones de salud como diabetes, hipertensión, colesterol alto o celiaquía, únicamente para personalizar tus recomendaciones nutricionales.
• Datos técnicos: tipo de dispositivo y errores de la app para mejorar la experiencia.

SUBPROCESADORES DE DATOS
Cuando usas las funciones de inteligencia artificial, tus datos nutricionales (nunca tu condición médica completa ni datos de identificación) son procesados por Anthropic PBC (anthropic.com) bajo sus políticas de privacidad. Anthropic no retiene datos de usuarios de forma permanente. Consulta su política en anthropic.com/privacy.

AVISO MÉDICO IMPORTANTE
El contenido generado por la IA de Calorú es orientativo y no constituye consejo médico profesional. Consulta siempre a un profesional de la salud certificado para decisiones relacionadas con tu salud, especialmente si tienes condiciones médicas diagnosticadas.

USO DE LOS DATOS
Usamos tus datos únicamente para:
— Mostrarte tu propio progreso nutricional.
— Sincronizar tu información entre dispositivos.
— Mejorar la funcionalidad de la app.

No vendemos, alquilamos ni compartimos tus datos con terceros con fines publicitarios.

ALMACENAMIENTO
Tus datos se almacenan en Supabase (servidores en São Paulo, Brasil) con cifrado en tránsito y en reposo. Los datos locales se guardan en tu dispositivo mediante localStorage.

TUS DERECHOS
Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier momento desde Perfil → Reiniciar configuración, o escribiéndonos a caloru.app@gmail.com.

MENORES DE EDAD
Calorú no está dirigida a menores de 13 años. No recopilamos intencionalmente datos de menores.

CAMBIOS
Notificaremos cambios relevantes en esta política mediante aviso en la app.

Última actualización: Mayo 2026.`;

  const terms = `Al usar Calorú aceptas estos términos. Si no estás de acuerdo, no uses la app.

USO PERMITIDO
Calorú es una herramienta de apoyo nutricional para uso personal. No reemplaza el consejo de un profesional de la salud. Los cálculos calóricos son estimaciones.

TU CUENTA
Eres responsable de mantener la confidencialidad de tu contraseña. Notifícanos de inmediato si sospechas acceso no autorizado.

CONTENIDO DEL USUARIO
Los datos que ingresas (alimentos, peso, objetivos) son tuyos. Nos otorgas una licencia limitada para procesarlos con el único fin de brindarte el servicio.

LIMITACIÓN DE RESPONSABILIDAD
Calorú no se hace responsable de decisiones de salud basadas en la información de la app. Consulta siempre a un profesional de la salud ante dudas médicas.

DISPONIBILIDAD
Nos esforzamos por mantener la app disponible, pero no garantizamos disponibilidad ininterrumpida. Podemos modificar o discontinuar funciones con previo aviso.

PROPIEDAD INTELECTUAL
El código, diseño y base de datos de alimentos chilenos son propiedad de Calorú. No puedes copiarlos ni redistribuirlos sin autorización.

CONTACTO
caloru.app@gmail.com

Última actualización: Mayo 2026.`;

  const content = isPrivacy ? privacy : terms;

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)'}}/>
      <div style={{
        position:'relative',background:'#FFFFFF',
        borderRadius:'24px 24px 0 0',
        maxHeight:'82vh',display:'flex',flexDirection:'column',
        animation:'fadeUp .25s ease',
      }}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}>
          <div style={{width:40,height:4,borderRadius:2,background:'#E5E5EA'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 20px 14px',borderBottom:'1px solid #F2F2F7'}}>
          <div style={{fontSize:16,fontWeight:800,color:'#1C1C1E',fontFamily:F}}>{title}</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:10,border:'1px solid #E5E5EA',background:'#F2F2F7',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#6D6D72'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px 40px'}}>
          {content.split('\n\n').map((para,i)=>(
            <div key={i} style={{marginBottom:14}}>
              {para.startsWith('—') || para.startsWith('•')
                ? para.split('\n').map((line,j)=>(
                  <div key={j} style={{fontSize:13,color:'#3C3C43',lineHeight:1.6,paddingLeft:8,marginBottom:2}}>{line}</div>
                ))
                : para === para.toUpperCase() && para.length < 50
                  ? <div style={{fontSize:11,fontWeight:700,color:'#6D6D72',letterSpacing:.5,textTransform:'uppercase',marginBottom:4,marginTop:i>0?8:0}}>{para}</div>
                  : <div style={{fontSize:13,color:'#1C1C1E',lineHeight:1.65,fontFamily:F}}>{para}</div>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [msg, setMsg]           = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [legal, setLegal]       = useState(null);
  const F = "'SF Pro Display','Helvetica Neue',sans-serif";

  const handle = async () => {
    if (resetMode) {
      if (!email) { setError('Ingresa tu email'); return; }
      setLoading(true); setError('');
      const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setLoading(false);
      if (e) { setError(e.message); return; }
      setMsg('✉️ Te enviamos un link para restablecer tu contraseña');
      return;
    }
    if (!email || !pass) { setError('Completa email y contraseña'); return; }
    setLoading(true); setError(''); setMsg('');
    try {
      if (mode === 'register') {
        const { error: e } = await supabase.auth.signUp({ email, password: pass });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (e) throw e;
      }
    } catch (e) {
      const msgs = {
        'Invalid login credentials':     'Email o contraseña incorrectos',
        'Email not confirmed':           'Confirma tu email primero',
        'User already registered':       'Ya existe una cuenta con ese email',
        'Password should be at least 6': 'La contraseña debe tener al menos 6 caracteres',
      };
      setError(msgs[e.message] || e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'#F2F2F7',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:F}}>
      {legal && <LegalModal type={legal} onClose={()=>setLegal(null)}/>}
      <div style={{marginBottom:28,textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:20,overflow:'hidden',margin:'0 auto 10px'}}><Logo size={72}/></div>
        <div style={{fontSize:26,fontWeight:800,color:'#1C1C1E',letterSpacing:'-1px'}}>Calor<span style={{color:'#D22B2B'}}>ú</span></div>
        <div style={{fontSize:13,color:'#6D6D72',marginTop:3}}>Tu nutrición, a tu ritmo</div>
      </div>
      <div style={{width:'100%',maxWidth:380,background:'white',borderRadius:24,padding:'22px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
        {resetMode ? (
          <>
            <div style={{fontSize:15,fontWeight:700,color:'#1C1C1E',marginBottom:4}}>Restablecer contraseña</div>
            <div style={{fontSize:12,color:'#6D6D72',marginBottom:14}}>Te enviaremos un link a tu email</div>
            <input type="email" placeholder="Tu email" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}
              style={{width:'100%',padding:'14px',borderRadius:14,border:'1.5px solid #E5E5EA',fontSize:15,fontFamily:F,outline:'none',boxSizing:'border-box',color:'#1C1C1E',marginBottom:12}}/>
          </>
        ) : (
          <>
            <div style={{display:'flex',background:'#F2F2F7',borderRadius:14,padding:3,marginBottom:18}}>
              {[['login','Iniciar sesión'],['register','Crear cuenta']].map(([k,l])=>(
                <button key={k} onClick={()=>{setMode(k);setError('');setMsg('');}} style={{
                  flex:1,padding:'9px',borderRadius:11,border:'none',cursor:'pointer',fontFamily:F,
                  fontWeight:600,fontSize:13,transition:'all .2s',
                  background:mode===k?'white':'transparent',color:mode===k?'#1C1C1E':'#6D6D72',
                  boxShadow:mode===k?'0 1px 4px rgba(0,0,0,0.1)':'none',
                }}>{l}</button>
              ))}
            </div>
            <input type="email" placeholder="Email" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}
              style={{width:'100%',padding:'14px',borderRadius:14,border:'1.5px solid #E5E5EA',fontSize:15,fontFamily:F,outline:'none',boxSizing:'border-box',color:'#1C1C1E',marginBottom:10}}/>
            <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={pass}
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}
              style={{width:'100%',padding:'14px',borderRadius:14,border:'1.5px solid #E5E5EA',fontSize:15,fontFamily:F,outline:'none',boxSizing:'border-box',color:'#1C1C1E',marginBottom:4}}/>
            {mode==='login'&&(
              <div style={{textAlign:'right',marginBottom:12}}>
                <button onClick={()=>{setResetMode(true);setError('');setMsg('');}} style={{background:'none',border:'none',fontSize:12,color:'#D42020',cursor:'pointer',fontFamily:F,fontWeight:500,padding:'4px 0'}}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </>
        )}
        {error&&<div style={{fontSize:12,color:'#FF3B30',marginBottom:10,textAlign:'center',fontWeight:600}}>{error}</div>}
        {msg&&<div style={{fontSize:12,color:'#34C759',marginBottom:10,textAlign:'center',fontWeight:600,lineHeight:1.5}}>{msg}</div>}
        <button onClick={handle} disabled={loading} style={{
          width:'100%',padding:'15px',borderRadius:16,border:'none',
          background:loading?'#C7C7CC':'#1C1C1E',
          color:'white',fontSize:15,fontWeight:800,cursor:loading?'default':'pointer',
          fontFamily:F,marginBottom:8,
        }}>
          {loading?'Cargando...':resetMode?'Enviar link →':mode==='login'?'Entrar →':'Crear cuenta →'}
        </button>
        {resetMode
          ?<button onClick={()=>{setResetMode(false);setError('');setMsg('');}} style={{width:'100%',padding:'11px',borderRadius:16,border:'1px solid #E5E5EA',background:'transparent',color:'#6D6D72',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>← Volver</button>
          :<button onClick={()=>onAuth(null)} style={{width:'100%',padding:'11px',borderRadius:16,border:'1px solid #E5E5EA',background:'transparent',color:'#6D6D72',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>Continuar sin cuenta</button>
        }
      </div>
      <div style={{marginTop:14,display:'flex',gap:14,justifyContent:'center'}}>
        <button onClick={()=>setLegal('privacy')} style={{background:'none',border:'none',fontSize:11,color:'#C7C7CC',cursor:'pointer',fontFamily:F}}>Política de privacidad</button>
        <span style={{color:'#C7C7CC',fontSize:11}}>·</span>
        <button onClick={()=>setLegal('terms')} style={{background:'none',border:'none',fontSize:11,color:'#C7C7CC',cursor:'pointer',fontFamily:F}}>Términos de servicio</button>
      </div>
    </div>
  );
}


class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(e){return {err:e};}
  componentDidCatch(e,i){console.error('Caloru crash:',e,i);}
  render(){
    if(this.state.err){
      return React.createElement('div',{style:{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,background:'#F2F2F7',fontFamily:"'Sora',sans-serif",textAlign:'center'}},
        React.createElement('div',{style:{fontSize:52,marginBottom:16}},'\uD83D\uDE35'),
        React.createElement('div',{style:{fontSize:20,fontWeight:800,color:'#1C1C1E',marginBottom:8}},'Algo sali\u00F3 mal'),
        React.createElement('div',{style:{fontSize:13,color:'#6D6D72',marginBottom:24,lineHeight:1.5}},this.state.err?.message||'Error inesperado'),
        React.createElement('button',{onClick:()=>window.location.reload(),style:{padding:'13px 28px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10}},'Recargar app'),
        React.createElement('button',{onClick:()=>{localStorage.clear();window.location.reload();},style:{padding:'11px 24px',borderRadius:14,border:'1px solid #E5E5EA',background:'white',color:'#FF3B30',fontSize:13,fontWeight:600,cursor:'pointer'}},'Borrar datos y reiniciar')
      );
    }
    return this.props.children;
  }
}

/* ══════════════════════════════════════════════
   MICRONUTRIENTES PRO
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   PREDICCIÓN DE PESO PRO
══════════════════════════════════════════════ */
function PredicionPesoModal({C, F, dark, weightHistory, perfil, obj, metas, onClose}) {
  const pesoActual = weightHistory.length > 0
    ? weightHistory[weightHistory.length-1].w
    : perfil.peso;

  const metaPeso = obj==='bajar' ? pesoActual - 10 : obj==='subir' ? pesoActual + 5 : pesoActual;
  const deficitDiario = obj==='bajar' ? (metas.cal * 0.20) : obj==='subir' ? -(metas.cal * 0.12) : 0;
  const calPorKg = 7700;
  const diasParaMeta = deficitDiario > 0 ? Math.round((Math.abs(metaPeso - pesoActual) * calPorKg) / deficitDiario) : 0;
  const fechaMeta = new Date();
  fechaMeta.setDate(fechaMeta.getDate() + diasParaMeta);

  // Calcular tendencia real del historial
  const ultimos = weightHistory.slice(-14);
  const tendenciaSemanal = ultimos.length >= 2
    ? ((ultimos[ultimos.length-1].w - ultimos[0].w) / (ultimos.length/7)).toFixed(2)
    : null;

  // Proyección de 12 semanas
  const semanas = 12;
  const pesoProyectado = Array.from({length:semanas+1},(_,i)=>{
    const cambioSemanal = obj==='bajar' ? -(deficitDiario*7/calPorKg) : obj==='subir' ? (deficitDiario*7/calPorKg) : 0;
    return +(pesoActual + cambioSemanal * i).toFixed(1);
  });

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📉 Predicción de Peso <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Card principal */}
        <div style={{background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:20,padding:'20px',marginBottom:14,color:'white',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',right:-20,top:-20,fontSize:80,opacity:0.1}}>📉</div>
          <div style={{fontSize:12,fontWeight:700,opacity:0.8,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Peso actual</div>
          <div style={{fontSize:42,fontWeight:900,lineHeight:1}}>{pesoActual} <span style={{fontSize:18}}>kg</span></div>
          {obj!=='mantener' && (
            <>
              <div style={{fontSize:12,opacity:0.8,marginTop:8}}>Meta: <strong>{metaPeso} kg</strong></div>
              {diasParaMeta > 0 && (
                <div style={{marginTop:10,background:'rgba(255,255,255,0.2)',borderRadius:12,padding:'10px 14px'}}>
                  <div style={{fontSize:13,fontWeight:700}}>🎯 Llegarás a tu meta el</div>
                  <div style={{fontSize:18,fontWeight:800,marginTop:2}}>{fechaMeta.toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric'})}</div>
                  <div style={{fontSize:11,opacity:0.8,marginTop:2}}>en aproximadamente {diasParaMeta} días</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tendencia real */}
        {tendenciaSemanal !== null && (
          <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>📊 Tu tendencia real</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:28}}>{parseFloat(tendenciaSemanal)<0?'📉':parseFloat(tendenciaSemanal)>0?'📈':'➡️'}</span>
              <div>
                <div style={{fontSize:20,fontWeight:800,color:parseFloat(tendenciaSemanal)<0&&obj==='bajar'?'#34C759':parseFloat(tendenciaSemanal)>0&&obj==='subir'?'#34C759':'#FF9500'}}>
                  {tendenciaSemanal > 0 ? '+' : ''}{tendenciaSemanal} kg/semana
                </div>
                <div style={{fontSize:11,color:C.textSec}}>Basado en tus últimos {ultimos.length} registros</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de proyección */}
        <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>📈 Proyección 12 semanas</div>
          <div style={{position:'relative',height:120}}>
            <svg width="100%" height="120" viewBox={`0 0 ${semanas} 120`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D42020" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#D42020" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {(() => {
                const min = Math.min(...pesoProyectado) - 1;
                const max = Math.max(...pesoProyectado) + 1;
                const range = max - min || 1;
                const pts = pesoProyectado.map((p,i) => `${i*(semanas/(semanas))*semanas/semanas*1},${100 - ((p-min)/range)*90}`);
                const pathD = pesoProyectado.map((p,i) => {
                  const x = (i/semanas)*100;
                  const y = 100 - ((p-min)/range)*90;
                  return `${i===0?'M':'L'}${x} ${y}`;
                }).join(' ');
                return (
                  <>
                    <path d={`${pathD} L100 120 L0 120 Z`} fill="url(#projGrad)"/>
                    <path d={pathD} fill="none" stroke="#D42020" strokeWidth="0.8"/>
                    {pesoProyectado.filter((_,i)=>i%3===0).map((p,i) => {
                      const idx = i*3;
                      const x = (idx/semanas)*100;
                      const y = 100 - ((p-min)/range)*90;
                      return <circle key={i} cx={x} cy={y} r="1.5" fill="#D42020"/>;
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
            <span style={{fontSize:10,color:C.textSec}}>Hoy</span>
            <span style={{fontSize:10,color:C.textSec}}>Semana 12</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:C.textSec}}>Inicio</div>
              <div style={{fontSize:14,fontWeight:800,color:C.text}}>{pesoProyectado[0]} kg</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:C.textSec}}>En 6 semanas</div>
              <div style={{fontSize:14,fontWeight:800,color:'#FF9500'}}>{pesoProyectado[6]} kg</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:C.textSec}}>En 12 semanas</div>
              <div style={{fontSize:14,fontWeight:800,color:'#34C759'}}>{pesoProyectado[12]} kg</div>
            </div>
          </div>
        </div>

        {/* Consejos */}
        <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>💡 Para alcanzar tu meta más rápido</div>
          {[
            obj==='bajar' ? '🥗 Prioriza proteínas en cada comida para mantener masa muscular' : '💪 Come más carbohidratos complejos alrededor del entrenamiento',
            obj==='bajar' ? '💧 Toma agua antes de cada comida para reducir el apetito' : '🥛 Incluye lácteos o proteína en el desayuno',
            '😴 Dormir 7-8 horas mejora el metabolismo hasta un 15%',
            obj==='bajar' ? '🚶 30 minutos de caminata diaria acelera el déficit calórico' : '🏋️ El entrenamiento de fuerza es clave para ganar masa',
          ].map((tip,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8,padding:'8px 10px',background:dark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',borderRadius:10}}>
              <span style={{fontSize:16,flexShrink:0}}>{tip.split(' ')[0]}</span>
              <span style={{fontSize:12,color:C.text,lineHeight:1.5}}>{tip.split(' ').slice(1).join(' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODO DIABÉTICOS / HIPERTENSOS PRO
══════════════════════════════════════════════ */
function ModoSaludEspecialModal({C, F, dark, log, onClose}) {
  const [modo, setModo] = React.useState('diabetes'); // diabetes | hipertension | ambos

  const totals = log.reduce((acc, item) => {
    const factor = (item.grams ? item.grams / (item.porcion || 100) : 1) * (item.qty || 1);
    acc.azucar  += (item.azucar  || 0) * factor;
    acc.sodio   += (item.sodio   || 0) * factor;
    acc.fibra   += (item.fibra   || 0) * factor;
    acc.carbs   += (item.carbs   || 0) * factor;
    acc.grasas  += (item.grasas  || 0) * factor;
    return acc;
  }, {azucar:0, sodio:0, fibra:0, carbs:0, grasas:0});

  const limites = {
    diabetes:    {azucar:{max:25,  label:'Azúcar',     unit:'g',  emoji:'🍬'},
                  carbs: {max:130, label:'Carbohidratos',unit:'g', emoji:'🌾'},
                  fibra: {min:25,  label:'Fibra',       unit:'g',  emoji:'🥦'}},
    hipertension:{sodio: {max:1500,label:'Sodio',       unit:'mg', emoji:'🧂'},
                  grasas:{max:50,  label:'Grasas',      unit:'g',  emoji:'🥑'}},
  };

  const alertas = [];
  if(modo==='diabetes'||modo==='ambos'){
    if(totals.azucar > 25) alertas.push({tipo:'danger', msg:`⚠️ Azúcar excedida: ${Math.round(totals.azucar)}g (máx 25g para diabéticos)`});
    if(totals.carbs > 130) alertas.push({tipo:'warning', msg:`⚠️ Carbohidratos altos: ${Math.round(totals.carbs)}g (recomendado <130g)`});
    if(totals.fibra < 20)  alertas.push({tipo:'info', msg:`ℹ️ Fibra baja: ${Math.round(totals.fibra)}g — ayuda a controlar glucosa`});
  }
  if(modo==='hipertension'||modo==='ambos'){
    if(totals.sodio > 1500) alertas.push({tipo:'danger', msg:`⚠️ Sodio excedido: ${Math.round(totals.sodio)}mg (máx 1500mg para hipertensos)`});
  }

  const itemsDiabetes = [
    {label:'Azúcar',val:totals.azucar,max:25,unit:'g',emoji:'🍬',color:'#FF2D55'},
    {label:'Carbohidratos',val:totals.carbs,max:130,unit:'g',emoji:'🌾',color:'#FF9500'},
    {label:'Fibra',val:totals.fibra,min:25,unit:'g',emoji:'🥦',color:'#34C759',invert:true},
  ];
  const itemsHiper = [
    {label:'Sodio',val:totals.sodio,max:1500,unit:'mg',emoji:'🧂',color:'#5856D6'},
    {label:'Grasas',val:totals.grasas,max:50,unit:'g',emoji:'🥑',color:'#FFD700'},
  ];
  const items = modo==='diabetes' ? itemsDiabetes : modo==='hipertension' ? itemsHiper : [...itemsDiabetes,...itemsHiper];

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>🏥 Salud Especial <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Selector de modo */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:14}}>
          {[['diabetes','🩸','Diabetes'],['hipertension','❤️','Hipertensión'],['ambos','🏥','Ambos']].map(([m,e,l])=>(
            <button key={m} onClick={()=>setModo(m)} style={{padding:'10px 6px',borderRadius:14,border:`2px solid ${modo===m?'#D42020':C.border}`,background:modo===m?'#D4202015':C.surface,color:modo===m?'#D42020':C.text,fontFamily:F,cursor:'pointer',fontWeight:700,fontSize:11,textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:2}}>{e}</div>{l}
            </button>
          ))}
        </div>

        {/* Alertas */}
        {alertas.length>0 && (
          <div style={{marginBottom:14}}>
            {alertas.map((a,i)=>(
              <div key={i} style={{padding:'10px 14px',borderRadius:14,marginBottom:6,background:a.tipo==='danger'?'rgba(255,59,48,0.1)':a.tipo==='warning'?'rgba(255,149,0,0.1)':'rgba(52,199,89,0.1)',border:`1px solid ${a.tipo==='danger'?'rgba(255,59,48,0.3)':a.tipo==='warning'?'rgba(255,149,0,0.3)':'rgba(52,199,89,0.3)'}`}}>
                <div style={{fontSize:12,color:a.tipo==='danger'?'#FF3B30':a.tipo==='warning'?'#FF9500':'#34C759',fontWeight:600}}>{a.msg}</div>
              </div>
            ))}
          </div>
        )}
        {alertas.length===0 && log.length>0 && (
          <div style={{padding:'12px 14px',borderRadius:14,marginBottom:14,background:'rgba(52,199,89,0.1)',border:'1px solid rgba(52,199,89,0.3)'}}>
            <div style={{fontSize:13,color:'#34C759',fontWeight:700}}>✅ ¡Todo dentro de los límites recomendados!</div>
          </div>
        )}

        {/* Indicadores */}
        {items.map(({label,val,max,min,unit,emoji,color,invert})=>{
          const pct = invert ? Math.min(100,Math.round((val/(min||25))*100)) : Math.min(100,Math.round((val/(max||1))*100));
          const ok = invert ? val>=(min||25) : val<=(max||999);
          return (
            <div key={label} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:20}}>{emoji}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{label}</div>
                    <div style={{fontSize:10,color:C.textSec}}>{invert?`Meta: mín ${min}${unit}`:`Límite: ${max}${unit}`}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:800,color:ok?'#34C759':'#FF3B30'}}>{Math.round(val)}{unit}</div>
                  <div style={{fontSize:10,color:ok?'#34C759':'#FF3B30',fontWeight:600}}>{ok?'✅ OK':'⚠️ Revisar'}</div>
                </div>
              </div>
              <div style={{height:8,background:C.surfaceAlt,borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:ok?color:'#FF3B30',borderRadius:4,transition:'width .5s ease'}}/>
              </div>
            </div>
          );
        })}

        {log.length===0 && (
          <div style={{textAlign:'center',padding:'40px 20px',color:C.textSec}}>
            <div style={{fontSize:48,marginBottom:12}}>🥗</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text}}>Sin registros hoy</div>
            <div style={{fontSize:13,marginTop:6}}>Agrega comidas para ver tu análisis de salud especial</div>
          </div>
        )}

        {/* Info médica */}
        <div style={{background:dark?'rgba(255,149,0,0.08)':'rgba(255,149,0,0.06)',borderRadius:14,padding:'12px 14px',marginTop:8,border:'1px solid rgba(255,149,0,0.2)'}}>
          <div style={{fontSize:11,color:'#FF9500',fontWeight:700,marginBottom:4}}>⚠️ Aviso médico</div>
          <div style={{fontSize:11,color:C.textSec,lineHeight:1.5}}>Esta herramienta es orientativa. Siempre consulta con tu médico o nutricionista para ajustar tu dieta según tu condición específica.</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORTE SEMANAL
══════════════════════════════════════════════ */
function ReporteSemanalModal({C, F, dark, onClose, isPro}) {
  const dias = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const log = LS.get('log_'+key,[]);
    const s = log.reduce((a,it)=>{
      const r=(it.grams?it.grams/(it.porcion||100):1);
      return {cal:a.cal+it.cal*r*(it.qty||1),prot:a.prot+it.prot*r*(it.qty||1),carbs:a.carbs+it.carbs*r*(it.qty||1),grasas:a.grasas+it.grasas*r*(it.qty||1)};
    },{cal:0,prot:0,carbs:0,grasas:0});
    const agua = LS.get('agua_'+key,0);
    return {key,label:d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric'}),cal:Math.round(s.cal),prot:Math.round(s.prot),carbs:Math.round(s.carbs),grasas:Math.round(s.grasas),agua,tiene:log.length>0};
  });

  const promedios = {
    cal:  Math.round(dias.filter(d=>d.tiene).reduce((s,d)=>s+d.cal,0)  / Math.max(1,dias.filter(d=>d.tiene).length)),
    prot: Math.round(dias.filter(d=>d.tiene).reduce((s,d)=>s+d.prot,0) / Math.max(1,dias.filter(d=>d.tiene).length)),
    agua: Math.round(dias.filter(d=>d.tiene).reduce((s,d)=>s+d.agua,0) / Math.max(1,dias.filter(d=>d.tiene).length)),
    diasRegistrados: dias.filter(d=>d.tiene).length,
  };
  const maxCal = Math.max(...dias.map(d=>d.cal), 1);

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📊 Reporte Semanal</div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Resumen */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[
            {label:'Días registrados',val:`${promedios.diasRegistrados}/7`,emoji:'📅',color:'#D42020'},
            {label:'Calorías promedio',val:`${promedios.cal} kcal`,emoji:'🔥',color:'#FF9500'},
            {label:'Proteína promedio',val:`${promedios.prot}g`,emoji:'💪',color:'#34C759'},
            {label:'Agua promedio',val:`${promedios.agua} vasos`,emoji:'💧',color:'#007AFF'},
          ].map(({label,val,emoji,color})=>(
            <div key={label} style={{background:C.surface,borderRadius:16,padding:'12px',border:`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:4}}>{emoji}</div>
              <div style={{fontSize:18,fontWeight:800,color}}>{val}</div>
              <div style={{fontSize:10,color:C.textSec,marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>

        {/* Gráfico de barras de calorías */}
        <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>🔥 Calorías por día</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
            {dias.map((d,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                <div style={{fontSize:8,color:C.textSec,fontWeight:600}}>{d.tiene?d.cal:''}</div>
                <div style={{
                  width:'100%',borderRadius:'4px 4px 0 0',
                  height:d.tiene?`${Math.max(8,(d.cal/maxCal)*60)}px`:'8px',
                  background:d.tiene?'#D42020':'#D4202020',
                  transition:'height .4s ease',
                }}/>
                <div style={{fontSize:9,color:C.textSec,textAlign:'center',lineHeight:1.2}}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle por día */}
        <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📋 Detalle por día</div>
          {dias.map((d,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:i<6?`1px solid ${C.border}`:'none'}}>
              <div style={{fontSize:13,color:C.text,fontWeight:d.label.includes('hoy')?700:400,minWidth:80}}>{d.label}</div>
              {d.tiene ? (
                <div style={{display:'flex',gap:12,fontSize:11}}>
                  <span style={{color:'#D42020',fontWeight:700}}>{d.cal}kcal</span>
                  <span style={{color:'#34C759',fontWeight:600}}>{d.prot}g prot</span>
                  <span style={{color:'#007AFF',fontWeight:600}}>{d.agua}💧</span>
                </div>
              ) : (
                <span style={{fontSize:11,color:C.textMuted}}>Sin registro</span>
              )}
            </div>
          ))}
        </div>

        {!isPro && (
          <div style={{background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:16,padding:'14px 16px',textAlign:'center',color:'white'}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>⭐ Calorú Pro</div>
            <div style={{fontSize:12,opacity:0.9}}>Exporta este reporte por email y accede a análisis avanzados por mes</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RECORDATORIOS DE COMIDA
══════════════════════════════════════════════ */
// Envía el schedule de notificaciones al Service Worker
const sendScheduleToSW = (reminders) => {
  if(!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  const now = new Date();
  const notifications = [];

  reminders.filter(r=>r.activo).forEach(r=>{
    const [hh, mm] = r.hora.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hh, mm, 0, 0);
    // Si ya pasó hoy, programar para mañana
    if(target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    const labels = {
      desayuno: {title:'🌅 Hora del desayuno', body:'¡Empieza el día registrando tu desayuno en Calorú!'},
      almuerzo: {title:'☀️ Hora del almuerzo', body:'¿Ya almorzaste? Regístralo para no perder tu racha.'},
      once:     {title:'☕ Hora de la once',    body:'Registra tu once y mantén el control de tu día.'},
      cena:     {title:'🌙 Hora de la cena',    body:'Cierra el día registrando tu cena en Calorú.'},
      agua:     {title:'💧 Recuerda hidratarte', body:'¿Cuántos vasos de agua llevas hoy?'},
      peso:     {title:'⚖️ Registro de peso',   body:'Momento de registrar tu peso de hoy.'},
    };
    const label = labels[r.id] || {title:`${r.emoji} ${r.label}`, body:'Recordatorio de Calorú'};
    notifications.push({ delay, title: label.title, body: label.body, tag: `caloru-${r.id}`, icon:'/icon-192.png' });
  });

  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_NOTIFICATIONS',
    notifications,
  });
};

function RecordatoriosModal({C, F, dark, onClose}) {
  const defaultReminders = [
    {id:'desayuno', label:'Desayuno',    emoji:'☀️',  hora:'08:00', activo:false},
    {id:'almuerzo', label:'Almuerzo',    emoji:'🍽️', hora:'13:00', activo:false},
    {id:'once',     label:'Once',        emoji:'☕',  hora:'17:00', activo:false},
    {id:'cena',     label:'Cena',        emoji:'🌙',  hora:'20:00', activo:false},
    {id:'agua',     label:'Tomar agua',  emoji:'💧',  hora:'10:00', activo:false},
    {id:'peso',     label:'Registrar peso',emoji:'⚖️',hora:'07:00', activo:false},
  ];
  const [reminders, setReminders] = React.useState(()=>LS.get('reminders', defaultReminders));
  const [permiso, setPermiso] = React.useState(null);

  const solicitarPermiso = async () => {
    if(!('Notification' in window)){setPermiso('no-soportado');return;}
    const result = await Notification.requestPermission();
    setPermiso(result);
    LS.set('notifPermiso', result);
    if(result === 'granted') sendScheduleToSW(reminders);
  };

  React.useEffect(()=>{
    if('Notification' in window) setPermiso(Notification.permission);
  },[]);

  // Re-enviar schedule al SW cada vez que se abra el modal (por si se reinició el SW)
  React.useEffect(()=>{
    if('Notification' in window && Notification.permission === 'granted') sendScheduleToSW(reminders);
  },[]);

  const toggleReminder = (id) => {
    const updated = reminders.map(r=>r.id===id?{...r,activo:!r.activo}:r);
    setReminders(updated);
    LS.set('reminders', updated);
    if('Notification' in window && Notification.permission === 'granted') sendScheduleToSW(updated);
  };

  const updateHora = (id, hora) => {
    const updated = reminders.map(r=>r.id===id?{...r,hora}:r);
    setReminders(updated);
    LS.set('reminders', updated);
    if('Notification' in window && Notification.permission === 'granted') sendScheduleToSW(updated);
  };

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>🔔 Recordatorios</div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Estado permisos */}
        {permiso !== 'granted' && (
          <div style={{background:dark?'rgba(255,149,0,0.1)':'rgba(255,149,0,0.08)',borderRadius:16,padding:'14px',marginBottom:14,border:'1px solid rgba(255,149,0,0.3)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#FF9500',marginBottom:6}}>🔔 Activar notificaciones</div>
            <div style={{fontSize:12,color:C.textSec,marginBottom:10}}>Necesitas permitir notificaciones para recibir recordatorios de comida.</div>
            {permiso==='no-soportado' ? (
              <div style={{fontSize:12,color:'#FF3B30'}}>Tu navegador no soporta notificaciones push.</div>
            ) : (
              <button onClick={solicitarPermiso} style={{padding:'8px 16px',borderRadius:10,border:'none',background:'#FF9500',color:'white',fontFamily:F,cursor:'pointer',fontSize:13,fontWeight:700}}>
                Permitir notificaciones
              </button>
            )}
          </div>
        )}
        {permiso === 'granted' && (
          <div style={{background:'rgba(52,199,89,0.08)',borderRadius:14,padding:'10px 14px',marginBottom:14,border:'1px solid rgba(52,199,89,0.3)'}}>
            <div style={{fontSize:12,color:'#34C759',fontWeight:700}}>✅ Notificaciones activadas</div>
          </div>
        )}

        {/* Lista de recordatorios */}
        {reminders.map((r,i)=>(
          <div key={r.id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${r.activo?'#D42020':C.border}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:24}}>{r.emoji}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{r.label}</div>
                  <input
                    type="time"
                    value={r.hora}
                    onChange={e=>updateHora(r.id,e.target.value)}
                    style={{fontSize:12,color:C.textSec,border:'none',background:'transparent',fontFamily:F,marginTop:2,cursor:'pointer',outline:'none'}}
                  />
                </div>
              </div>
              <button onClick={()=>toggleReminder(r.id)} style={{
                width:48,height:28,borderRadius:14,border:'none',cursor:'pointer',
                background:r.activo?'#D42020':'#D4202030',
                position:'relative',transition:'background .2s',
              }}>
                <div style={{
                  position:'absolute',top:3,left:r.activo?22:4,
                  width:22,height:22,borderRadius:11,background:'white',
                  transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                }}/>
              </button>
            </div>
          </div>
        ))}

        <div style={{background:dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',borderRadius:14,padding:'12px 14px',marginTop:4,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.textSec,lineHeight:1.5}}>💡 Los recordatorios funcionan cuando la app está abierta en segundo plano. Para mejores resultados, instala Calorú como app en tu dispositivo.</div>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════
   PLAN SEMANAL AUTOMÁTICO IA PRO
══════════════════════════════════════════════ */
function PlanSemanalIAModal({C, F, dark, nombre, perfil, obj, metas, ritmo, userAllergens, veganMode, condicion='ninguna', condiciones=null, onClose}) {
  const conds = Array.isArray(condiciones)&&condiciones.length ? condiciones : (condicion&&condicion!=='ninguna'?[condicion]:[]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [diaActivo, setDiaActivo] = useState(0);

  const generarPlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const objTexto = {bajar:'bajar de peso',mantener:'mantener peso',subir:'ganar músculo',recomp:'recomposición corporal'}[obj]||'mantener peso';
      const ritmoTexto = RITMOS[ritmo]?.label || 'Normal';
      const alerg = userAllergens.length>0 ? `Alergias: ${userAllergens.join(', ')}.` : '';
      const vegan = veganMode ? 'Es VEGANO.' : '';
      const condMap = {diabetes:'TIENE DIABETES TIPO 2: bajo índice glucémico, sin azúcares simples.',hipertension:'TIENE HIPERTENSIÓN: máx 2000mg sodio/día.',colesterol:'TIENE COLESTEROL ALTO: sin grasas saturadas ni trans.',celiaco:'TIENE CELIAQUÍA: sin gluten.'};
      const condTexto = conds.map(c=>condMap[c]).filter(Boolean).join(' ');
      const prompt = `Crea un plan de alimentación semanal completo para ${nombre}.
Objetivo: ${objTexto}. Ritmo: ${ritmoTexto}. Calorías diarias: ${metas.cal} kcal. Proteínas: ${metas.prot}g. ${alerg} ${vegan} ${condTexto}
Usa ingredientes disponibles en supermercados chilenos (Jumbo, Lider, Santa Isabel).
Responde SOLO con este JSON:
{
  "dias": [
    {
      "dia": "Lunes",
      "emoji": "emoji del día",
      "comidas": {
        "desayuno": {"nombre": "nombre", "calorias": numero, "descripcion": "breve desc"},
        "almuerzo": {"nombre": "nombre", "calorias": numero, "descripcion": "breve desc"},
        "once": {"nombre": "nombre", "calorias": numero, "descripcion": "breve desc"},
        "cena": {"nombre": "nombre", "calorias": numero, "descripcion": "breve desc"}
      },
      "total_cal": numero,
      "tip": "tip nutricional del día"
    }
  ]
}
Incluye los 7 días de la semana.`;

      const data = await callEdgeFn({
        mode: 'chat',
        system: 'Eres un nutricionista chileno experto. Propones comidas con ingredientes reales de supermercados chilenos (Jumbo, Lider, Santa Isabel) y marcas nacionales (Soprole, Colún, Carozzi, Super Pollo, La Crianza, Fruna, Ideal, Costa). Responde SOLO con JSON válido, sin texto adicional ni backticks.',
        messages: [{role:'user', content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      setPlan(JSON.parse(jsonMatch[0]));
    } catch(e) {
      console.error('PlanSemanal error:', e);
      setPlan({error:'No se pudo generar el plan. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  const DIAS_EMOJIS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>📅 Plan Semanal IA <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        <div style={{background:C.surface,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,color:C.textSec}}>La IA genera un plan de 7 días adaptado a tu objetivo, ritmo y preferencias alimentarias con productos chilenos.</div>
        </div>
        <button onClick={generarPlan} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#D42020,#5856D6)',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:16,opacity:loading?0.7:1}}>
          {loading?'🤖 Generando plan semanal...':'📅 Generar plan de 7 días'}
        </button>
        {(userAllergens.length>0||veganMode)&&(
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12,padding:'8px 12px',background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:12,border:'1px solid rgba(52,199,89,0.3)'}}>
            <span style={{fontSize:14}}>✅</span>
            <span style={{fontSize:11,color:'#34C759',fontWeight:600}}>Plan adaptado: {[veganMode&&'vegano',...userAllergens].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {plan&&!plan.error&&(
          <>
            {/* Selector de días */}
            <div style={{display:'flex',gap:4,overflowX:'auto',marginBottom:14,paddingBottom:4,scrollbarWidth:'none'}}>
              {plan.dias?.map((d,i)=>(
                <button key={i} onClick={()=>setDiaActivo(i)} style={{
                  flexShrink:0,padding:'8px 12px',borderRadius:14,border:`2px solid ${diaActivo===i?'#D42020':C.border}`,
                  background:diaActivo===i?'#D4202015':C.surface,
                  color:diaActivo===i?'#D42020':C.text,
                  fontFamily:F,cursor:'pointer',fontWeight:700,fontSize:11,
                }}>
                  {d.emoji} {d.dia?.slice(0,3)}
                </button>
              ))}
            </div>
            {/* Detalle del día */}
            {plan.dias?.[diaActivo]&&(()=>{
              const dia = plan.dias[diaActivo];
              return (
                <div>
                  <div style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{fontSize:16,fontWeight:800,color:C.text}}>{dia.emoji} {dia.dia}</div>
                      <div style={{fontSize:13,fontWeight:700,color:'#D42020'}}>{dia.total_cal} kcal</div>
                    </div>
                    {['desayuno','almuerzo','once','cena'].map(comida=>{
                      const c = dia.comidas?.[comida];
                      if(!c) return null;
                      const emojis = {desayuno:'☀️',almuerzo:'🍽️',once:'☕',cena:'🌙'};
                      return (
                        <div key={comida} style={{padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'capitalize',marginBottom:2}}>{emojis[comida]} {comida}</div>
                              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.nombre}</div>
                              <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{c.descripcion}</div>
                            </div>
                            <div style={{fontSize:12,fontWeight:700,color:'#FF9500',marginLeft:8}}>{c.calorias} kcal</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {dia.tip&&(
                    <div style={{background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:14,padding:'12px',border:'1px solid rgba(52,199,89,0.3)'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#34C759',marginBottom:4}}>💡 Tip del día</div>
                      <div style={{fontSize:12,color:C.text}}>{dia.tip}</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
        {plan?.error&&(
          <div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{plan.error}</div>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════
   QUÉ COMO HOY — sugerencia inteligente
══════════════════════════════════════════════ */
function QueComerHoyModal({C, F, dark, tot, metas, log, obj, userAllergens, veganMode, ritmo, onClose}) {
  const [loading, setLoading] = useState(false);
  const [sugerencia, setSugerencia] = useState(null);

  const hora = new Date().getHours();
  const momento = hora<11?'desayuno':hora<15?'almuerzo':hora<19?'once':'cena';
  const calRestantes = Math.max(0, Math.round(metas.cal - tot.cal));
  const protRestante = Math.max(0, Math.round(metas.prot - tot.prot));

  const generarSugerencia = async () => {
    setLoading(true);
    setSugerencia(null);
    try {
      const alerg = userAllergens.length>0?`Alergias: ${userAllergens.join(', ')}.`:'';
      const vegan = veganMode?'Es VEGANO.':'';
      const objTexto = {bajar:'bajar de peso',mantener:'mantener peso',subir:'ganar músculo',recomp:'recomposición'}[obj]||'mantener peso';
      const prompt = `Son las ${hora}:00 hrs en Chile. El usuario quiere ${objTexto}.
Le quedan ${calRestantes} kcal y ${protRestante}g de proteína para hoy.
${alerg} ${vegan}
Sugiere 3 opciones concretas de ${momento} con ingredientes chilenos fáciles de conseguir.
Responde SOLO con JSON:
{
  "momento": "${momento}",
  "opciones": [
    {"nombre": "nombre", "emoji": "emoji", "calorias": numero, "proteina": numero, "tiempo": "X min", "ingredientes": ["ing1","ing2"], "por_que": "razón corta"},
    {"nombre": "nombre", "emoji": "emoji", "calorias": numero, "proteina": numero, "tiempo": "X min", "ingredientes": ["ing1","ing2"], "por_que": "razón corta"},
    {"nombre": "nombre", "emoji": "emoji", "calorias": numero, "proteina": numero, "tiempo": "X min", "ingredientes": ["ing1","ing2"], "por_que": "razón corta"}
  ],
  "consejo": "consejo nutricional breve para el resto del día"
}`;
      const data = await callEdgeFn({
        mode: 'chat',
        system: 'Eres nutricionista chileno experto. Propones opciones concretas con ingredientes disponibles en Chile (Jumbo, Lider, Santa Isabel) y alimentos típicos chilenos. Incluye opciones rápidas y fáciles de preparar. Responde SOLO con JSON válido, sin texto adicional ni backticks.',
        messages: [{role:'user', content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      const parsed = JSON.parse(jsonMatch[0]);
      setSugerencia(parsed);
    } catch(e) {
      console.error('QueComer error:', e);
      setSugerencia({error:'No se pudo generar sugerencia. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  React.useEffect(()=>{ generarSugerencia(); },[]);

  const momentoEmoji = {desayuno:'☀️',almuerzo:'🍽️',once:'☕',cena:'🌙'}[momento];

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>{momentoEmoji} ¿Qué como hoy?</div>
        <button onClick={generarSugerencia} disabled={loading} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#D42020'}}>🔄</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        <div style={{background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:18,padding:'14px 16px',marginBottom:14,color:'white'}}>
          <div style={{fontSize:12,opacity:0.85,marginBottom:2}}>Ahora es hora de {momento}</div>
          <div style={{fontSize:16,fontWeight:800}}>Te quedan {calRestantes} kcal y {protRestante}g proteína</div>
        </div>

        {loading&&(
          <div style={{textAlign:'center',padding:'40px 20px',color:C.textSec}}>
            <div style={{fontSize:40,marginBottom:12,animation:'spin 1s linear infinite'}}>🤖</div>
            <div style={{fontSize:14,fontWeight:600,color:C.text}}>Pensando en opciones para ti...</div>
          </div>
        )}

        {sugerencia&&!sugerencia.error&&(
          <>
            {sugerencia.opciones?.map((op,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
                  <span style={{fontSize:32,flexShrink:0}}>{op.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.text}}>{op.nombre}</div>
                    <div style={{fontSize:11,color:C.textSec,marginTop:2}}>⏱️ {op.tiempo} · 🔥 {op.calorias} kcal · 💪 {op.proteina}g prot</div>
                    <div style={{fontSize:11,color:'#34C759',marginTop:4,fontStyle:'italic'}}>{op.por_que}</div>
                  </div>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                  {op.ingredientes?.map((ing,j)=>(
                    <span key={j} style={{fontSize:10,padding:'3px 8px',borderRadius:8,background:C.surfaceAlt,color:C.textSec,fontWeight:600}}>{ing}</span>
                  ))}
                </div>
              </div>
            ))}
            {sugerencia.consejo&&(
              <div style={{background:dark?'rgba(255,149,0,0.1)':'rgba(255,149,0,0.08)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(255,149,0,0.3)'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#FF9500',marginBottom:4}}>💡 Consejo para hoy</div>
                <div style={{fontSize:12,color:C.text}}>{sugerencia.consejo}</div>
              </div>
            )}
          </>
        )}
        {sugerencia?.error&&(
          <div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{sugerencia.error}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DESAFÍOS COMUNITARIOS (Free)
══════════════════════════════════════════════ */
function DesafiosComunidadModal({C, F, dark, log, agua, waterGoal, exercises, streak, tot, metas, supabaseUser, nombre, obj, onClose}) {
  const DESAFIOS_BASE = [
    {id:'agua7',      emoji:'💧', titulo:'Semana hidratada',       desc:'Toma tu meta de agua hoy',                  xp:50,  check:()=>agua>=waterGoal},
    {id:'proteina3',  emoji:'💪', titulo:'Rey de la proteína',     desc:'Cumple tu meta de proteína hoy',             xp:40,  check:()=>tot.prot>=metas.prot*0.9},
    {id:'ejercicio5', emoji:'🏃', titulo:'Semana activa',          desc:'Registra un ejercicio hoy',                  xp:60,  check:()=>exercises.length>0},
    {id:'racha7',     emoji:'🔥', titulo:'Racha de fuego',         desc:'Mantén tu racha activa',                     xp:70,  check:()=>streak.days>=7},
    {id:'chileno3',   emoji:'🇨🇱', titulo:'Orgullosamente chileno', desc:'Come un plato chileno hoy',                  xp:30,  check:()=>log.some(i=>['cazuela','empanada','sopaipilla','porotos','churrasco','completo','charquicán','humitas','pastel de choclo'].some(p=>i.nombre?.toLowerCase().includes(p)))},
    {id:'calorias5',  emoji:'🎯', titulo:'En tu meta',             desc:'Cumple tu meta calórica hoy',                xp:80,  check:()=>metas.cal>0&&tot.cal/metas.cal>=0.85&&tot.cal/metas.cal<=1.1},
    {id:'log3comidas',emoji:'🍽️', titulo:'3 comidas al día',       desc:'Registra desayuno, almuerzo y cena',         xp:25,  check:()=>log.length>=3},
    {id:'verduras',   emoji:'🥗', titulo:'Come verde',             desc:'Agrega verduras en tus comidas',             xp:35,  check:()=>log.some(i=>['ensalada','lechuga','espinaca','brócoli','acelga','tomate','pepino'].some(p=>i.nombre?.toLowerCase().includes(p)))},
  ];

  const weekKey = `desafios_${new Date().getFullYear()}_${Math.ceil((new Date() - new Date(new Date().getFullYear(),0,1))/604800000)}`;
  const [completados, setCompletados]   = useState(()=>LS.get(weekKey,[]));
  const [desafiosIA,  setDesafiosIA]    = useState(()=>LS.get(weekKey+'_ia',null));
  const [loadingIA,   setLoadingIA]     = useState(false);
  const [tab, setTab]                   = useState('semana'); // semana | personalizados

  const completarDesafio = (id, xp) => {
    if(completados.includes(id)) return;
    const nuevos = [...completados, id];
    setCompletados(nuevos);
    LS.set(weekKey, nuevos);
    haptic('goal');
  };

  const generarDesafiosIA = async () => {
    setLoadingIA(true);
    try {
      const alimentos = log.slice(0,8).map(i=>i.nombre).join(', ') || 'variado';
      const objTexto = {bajar:'bajar de peso',mantener:'mantener peso',subir:'ganar músculo'}[obj]||'mantener peso';
      const prompt = `El usuario ${nombre} quiere ${objTexto}. Racha: ${streak.days} días. Come: ${alimentos}. Proteína hoy: ${Math.round(tot.prot)}/${metas.prot}g.
Genera 3 desafíos semanales personalizados y motivadores en formato JSON:
{"desafios":[{"id":"d1","emoji":"emoji","titulo":"título corto","desc":"descripción motivadora específica para este usuario","xp":número entre 30 y 100,"tipo":"nutricion|ejercicio|habito"}]}
Solo JSON, sin texto adicional.`;
      const data = await callEdgeFn({mode:'chat', system:'Eres un coach nutricional chileno. Genera desafíos semanales específicos, motivadores y alcanzables para usuarios chilenos. Solo JSON válido, sin texto adicional.', messages:[{role:'user',content:prompt}]});
      const text = data.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if(match){
        const parsed = JSON.parse(match[0]);
        const desafios = Array.isArray(parsed.desafios) ? parsed.desafios : [];
        if(desafios.length){
          setDesafiosIA(desafios);
          LS.set(weekKey+'_ia', desafios);
        }
      }
    } catch(e){ console.error('DesafiosIA error:',e); }
    setLoadingIA(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>🏅 Desafíos</div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,background:C.surface,borderRadius:14,padding:4,border:`1px solid ${C.border}`}}>
          {[['semana','🏆 Semanales'],['personalizados','🤖 Para ti']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:tab===t?'#D42020':'transparent',color:tab===t?'white':C.textSec,fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>
              {l}
            </button>
          ))}
        </div>

        {tab==='semana'&&(
          <>
            <div style={{background:'linear-gradient(135deg,#FF9500,#FFD700)',borderRadius:18,padding:'14px 16px',marginBottom:14,color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:12,opacity:0.85}}>Esta semana</div>
                <div style={{fontSize:20,fontWeight:800}}>{completados.filter(id=>DESAFIOS_BASE.some(d=>d.id===id)).length}/{DESAFIOS_BASE.length} completados</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:24}}>🔥</div>
                <div style={{fontSize:11,opacity:0.85}}>Racha: {streak.days} días</div>
              </div>
            </div>
            {DESAFIOS_BASE.map((d)=>{
              const completado = completados.includes(d.id);
              const cumple = d.check();
              return (
                <div key={d.id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`2px solid ${completado?'#FFD700':cumple?'#34C759':C.border}`,opacity:completado?0.8:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:14,background:completado?'#FFD70020':cumple?'#34C75920':C.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                      {completado?'✅':d.emoji}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{d.titulo}</div>
                      <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{d.desc}</div>
                      <div style={{fontSize:10,color:'#FFD700',fontWeight:700,marginTop:2}}>+{d.xp} XP</div>
                    </div>
                    {!completado&&cumple&&(
                      <button onClick={()=>completarDesafio(d.id,d.xp)} style={{padding:'8px 14px',borderRadius:12,border:'none',background:'#34C759',color:'white',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>
                        ¡Reclamar!
                      </button>
                    )}
                    {completado&&<span style={{fontSize:20,flexShrink:0}}>🏅</span>}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab==='personalizados'&&(
          <>
            <div style={{background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:18,padding:'14px 16px',marginBottom:14,color:'white'}}>
              <div style={{fontSize:12,opacity:0.85,marginBottom:4}}>🤖 Generados por IA para ti</div>
              <div style={{fontSize:16,fontWeight:800}}>Desafíos según tus hábitos</div>
              <div style={{fontSize:11,opacity:0.75,marginTop:2}}>Basados en tu racha, objetivos y comidas recientes</div>
            </div>

            {!desafiosIA&&!loadingIA&&(
              <div style={{textAlign:'center',padding:'30px 20px'}}>
                <div style={{fontSize:48,marginBottom:12}}>🎯</div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:8}}>Desafíos personalizados para {nombre.split(' ')[0]}</div>
                <div style={{fontSize:12,color:C.textSec,marginBottom:20,lineHeight:1.5}}>La IA analiza tu racha, objetivos y hábitos para crear desafíos hechos solo para ti</div>
                <button onClick={generarDesafiosIA} style={{padding:'14px 28px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800,boxShadow:'0 6px 16px rgba(212,32,32,0.3)'}}>
                  🤖 Generar mis desafíos
                </button>
              </div>
            )}

            {loadingIA&&(
              <div style={{textAlign:'center',padding:'40px 20px'}}>
                <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                <div style={{fontSize:14,color:C.textSec}}>Analizando tus hábitos...</div>
              </div>
            )}

            {desafiosIA&&desafiosIA.map((d,i)=>{
              const id = d.id || `ia_${i}`;
              const completado = completados.includes(id);
              return (
                <div key={id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`2px solid ${completado?'#FFD700':'#D4202030'}`,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,right:0,background:'#D42020',borderRadius:'0 0 0 12px',padding:'3px 10px'}}>
                    <span style={{fontSize:9,fontWeight:800,color:'white'}}>IA</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:14,background:completado?'#FFD70020':'#D4202012',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
                      {completado?'✅':d.emoji}
                    </div>
                    <div style={{flex:1,paddingRight:20}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{d.titulo}</div>
                      <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{d.desc}</div>
                      <div style={{fontSize:10,color:'#FFD700',fontWeight:700,marginTop:2}}>+{d.xp} XP</div>
                    </div>
                    {!completado&&(
                      <button onClick={()=>completarDesafio(id,d.xp)} style={{padding:'8px 14px',borderRadius:12,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>
                        Completar
                      </button>
                    )}
                    {completado&&<span style={{fontSize:20,flexShrink:0}}>🏅</span>}
                  </div>
                </div>
              );
            })}

            {desafiosIA&&(
              <button onClick={generarDesafiosIA} style={{width:'100%',padding:'12px',borderRadius:14,border:`1px solid ${C.border}`,background:'none',color:C.textSec,fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:600,marginTop:4}}>
                🔄 Regenerar desafíos
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LIGAS CON AMIGOS (Pro)
══════════════════════════════════════════════ */
function LigaAmigosModal({C, F, dark, supabaseUser, nombre, saludScore, streak, xpTotal, isPro, onClose}) {
  const [loading, setLoading] = useState(false);
  const [liga, setLiga] = useState(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [miCodigo] = useState(()=>{
    const saved = LS.get('miCodigoLiga','');
    if(saved) return saved;
    const nuevo = nombre.slice(0,3).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
    LS.set('miCodigoLiga', nuevo);
    return nuevo;
  });
  const [tab, setTab] = useState('ranking'); // ranking | unirse | invitar

  const cargarLiga = async () => {
    if(!supabaseUser) return;
    setLoading(true);
    try {
      // Obtener top usuarios (solo nombre, sin subscription_status por privacidad)
      const {data} = await supabase
        .from('profiles')
        .select('nombre')
        .limit(20);
      
      // Ranking con hash determinista del nombre para valores estables entre renders
      const hashNum = (s, mod, offset=0) => {
        let h = 0;
        for(let i=0; i<s.length; i++) h = (h*31 + s.charCodeAt(i)) & 0xffffffff;
        return (Math.abs(h) % mod) + offset;
      };
      const ranking = (data||[]).map((p,i)=>{
        const seed = (p.nombre||'Usuario')+i;
        return {
          nombre: p.nombre || 'Usuario',
          xp: hashNum(seed, 450, 80),
          streak: hashNum(seed+'s', 13, 1),
          score: hashNum(seed+'sc', 40, 50),
          esYo: false,
        };
      });
      
      // Agregar al usuario actual
      ranking.push({nombre, xp:xpTotal, streak:streak.days, score:saludScore, esYo:true});
      ranking.sort((a,b)=>b.xp-a.xp);
      setLiga(ranking.slice(0,10));
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  React.useEffect(()=>{ if(isPro) cargarLiga(); },[]);

  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>👥 Liga Calorú <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,background:C.surface,borderRadius:14,padding:4,border:`1px solid ${C.border}`}}>
          {[['ranking','🏆 Ranking'],['invitar','📤 Invitar']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:tab===t?'#D42020':'transparent',color:tab===t?'white':C.textSec,fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>
              {l}
            </button>
          ))}
        </div>

        {tab==='ranking'&&(
          <>
            <div style={{background:'linear-gradient(135deg,#FFD700,#FF9500)',borderRadius:18,padding:'14px 16px',marginBottom:10,color:'white'}}>
              <div style={{fontSize:12,opacity:0.85}}>Ranking semanal global</div>
              <div style={{fontSize:18,fontWeight:800}}>¿Quién come más sano esta semana?</div>
            </div>
            {/* Racha del usuario destacada */}
            <div style={{background:C.surface,borderRadius:16,padding:'12px 16px',marginBottom:14,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:32}}>🔥</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:C.textSec}}>Tu racha actual</div>
                <div style={{fontSize:22,fontWeight:800,color:streak.days>=7?'#FF9500':streak.days>=3?'#FFD700':'#C7C7CC',lineHeight:1}}>{streak.days} días</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:C.textSec}}>Meta</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>🏆 14 días</div>
              </div>
            </div>
            {loading&&<div style={{textAlign:'center',padding:'30px',color:C.textSec}}>Cargando ranking...</div>}
            {liga?.map((u,i)=>{
              const streakColor = u.streak>=14?'#FF6B00':u.streak>=7?'#FF9500':u.streak>=3?'#FFD700':'#C7C7CC';
              return(
              <div key={i} style={{background:u.esYo?'#D4202015':C.surface,borderRadius:16,padding:'12px 14px',marginBottom:8,border:`1.5px solid ${u.esYo?'#D42020':C.border}`,display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:10,background:i<3?'#FFD70020':C.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:i<3?20:14,fontWeight:800,color:i>=3?C.textSec:'',flexShrink:0}}>
                  {i<3?medals[i]:i+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:u.esYo?'#D42020':C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.nombre}{u.esYo?' (tú)':''}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                    <div style={{display:'flex',alignItems:'center',gap:3,background:`${streakColor}18`,borderRadius:8,padding:'2px 7px'}}>
                      <span style={{fontSize:11}}>🔥</span>
                      <span style={{fontSize:11,fontWeight:800,color:streakColor}}>{u.streak}</span>
                    </div>
                    <span style={{fontSize:10,color:C.textSec}}>⭐ {u.score} pts</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:800,color:'#FFD700'}}>{u.xp}</div>
                  <div style={{fontSize:9,color:C.textSec}}>XP sem.</div>
                </div>
              </div>
              );
            })}
          </>
        )}

        {tab==='invitar'&&(
          <div>
            <div style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:13,color:C.textSec,marginBottom:8}}>Tu código de liga</div>
              <div style={{fontSize:32,fontWeight:900,color:'#D42020',letterSpacing:4,marginBottom:8}}>{miCodigo}</div>
              <button onClick={()=>{navigator.clipboard?.writeText(miCodigo);}} style={{padding:'8px 20px',borderRadius:12,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>
                📋 Copiar código
              </button>
            </div>
            <div style={{background:C.surface,borderRadius:18,padding:'16px',border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>Unirse a una liga</div>
              <input value={codigoInput} onChange={e=>setCodigoInput(e.target.value.toUpperCase())} placeholder="Ingresa código de amigo" style={{width:'100%',padding:'10px 14px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:14,fontFamily:F,outline:'none',marginBottom:10,boxSizing:'border-box'}}/>
              <button onClick={()=>{if(codigoInput.length>=5){haptic('goal');}}} style={{width:'100%',padding:'12px',borderRadius:14,border:'none',background:'#34C759',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:700}}>
                Unirse a la liga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RECETAS CON INGREDIENTES DE TEMPORADA (Pro)
══════════════════════════════════════════════ */
function RecetasTemporadaModal({C, F, dark, obj, userAllergens, veganMode, onClose}) {
  const [loading, setLoading] = useState(false);
  const [recetas, setRecetas] = useState(null);

  const mes = new Date().getMonth();
  const temporada = mes>=11||mes<=1?'verano':mes>=2&&mes<=4?'otoño':mes>=5&&mes<=7?'invierno':'primavera';
  const temporadaEmoji = {verano:'☀️',otoño:'🍂',invierno:'❄️',primavera:'🌸'}[temporada];

  const generarRecetas = async () => {
    setLoading(true);
    setRecetas(null);
    try {
      const alerg = userAllergens.length>0?`Alergias: ${userAllergens.join(', ')}.`:'';
      const vegan = veganMode?'Es VEGANO, sin productos animales.':'';
      const objTexto = {bajar:'bajar de peso',mantener:'mantener peso',subir:'ganar músculo',recomp:'recomposición'}[obj]||'mantener peso';
      
      const ingredientesTemp = {
        verano: 'tomate, pepino, sandía, melón, choclo, palta, frutillas, duraznos, pimientos',
        otoño: 'zapallo, manzana, pera, uvas, champiñones, alcachofas, espinaca',
        invierno: 'naranja, limón, kiwi, brócoli, coliflor, papa, zanahoria, betarraga',
        primavera: 'espárragos, arvejas, porotos verdes, fresas, cerezas, lechuga'
      }[temporada];

      const prompt = `Es ${temporada} en Chile. Los ingredientes de temporada y más económicos ahora son: ${ingredientesTemp}.
Crea 3 recetas saludables y económicas aprovechando estos ingredientes de temporada.
Objetivo del usuario: ${objTexto}. ${alerg} ${vegan}
Responde SOLO con JSON:
{
  "temporada": "${temporada}",
  "recetas": [
    {
      "nombre": "nombre",
      "emoji": "emoji",
      "tiempo": "X min",
      "calorias": numero,
      "precio_estimado": "rango en CLP",
      "ingredientes_temporada": ["ing1","ing2"],
      "ingredientes_resto": ["ing1","ing2"],
      "pasos": ["paso1","paso2","paso3"],
      "por_que_ahora": "razón de temporada",
      "macros": {"prot": numero, "carbs": numero, "grasas": numero}
    }
  ]
}`;

      const data = await callEdgeFn({
        mode: 'chat',
        system: 'Eres chef nutricionista chileno experto en cocina de temporada. Usas ingredientes frescos y económicos del mercado chileno. Las recetas son simples, nutritivas y con pasos claros. Responde SOLO con JSON válido, sin texto adicional ni backticks.',
        messages: [{role:'user', content:prompt}],
        max_tokens: 2500,
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      const parsed = JSON.parse(jsonMatch[0]);
      setRecetas(parsed);
    } catch(e) {
      console.error('RecetasTemp error:', e);
      setRecetas({error:'No se pudo generar recetas. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>{temporadaEmoji} {temporada.charAt(0).toUpperCase()+temporada.slice(1)} <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        <div style={{background:`linear-gradient(135deg,${temporada==='verano'?'#FF9500,#FFD700':temporada==='otoño'?'#FF6B00,#D42020':temporada==='invierno'?'#5856D6,#007AFF':'#34C759,#30D158'})`,borderRadius:18,padding:'14px 16px',marginBottom:14,color:'white'}}>
          <div style={{fontSize:12,opacity:0.85}}>Ingredientes de temporada en Chile</div>
          <div style={{fontSize:17,fontWeight:800}}>{temporadaEmoji} {temporada.charAt(0).toUpperCase()+temporada.slice(1)} — Más frescos y económicos ahora</div>
        </div>
        <button onClick={generarRecetas} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'#34C759',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:14,opacity:loading?0.7:1}}>
          {loading?`${temporadaEmoji} Generando recetas de ${temporada}...`:`${temporadaEmoji} Ver recetas de temporada`}
        </button>
        {recetas&&!recetas.error&&recetas.recetas?.map((r,i)=>(
          <div key={i} style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <span style={{fontSize:32}}>{r.emoji}</span>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:C.text}}>{r.nombre}</div>
                <div style={{fontSize:11,color:C.textSec}}>⏱️ {r.tiempo} · 🔥 {r.calorias} kcal · 💰 {r.precio_estimado}</div>
              </div>
            </div>
            <div style={{background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:10,padding:'8px 10px',marginBottom:10,border:'1px solid rgba(52,199,89,0.2)'}}>
              <div style={{fontSize:11,color:'#34C759',fontWeight:600}}>{temporadaEmoji} {r.por_que_ahora}</div>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:4}}>🛒 Ingredientes de temporada</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {r.ingredientes_temporada?.map((ing,j)=>(
                  <span key={j} style={{fontSize:10,padding:'3px 8px',borderRadius:8,background:'rgba(52,199,89,0.15)',color:'#34C759',fontWeight:600}}>{ing}</span>
                ))}
              </div>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:4}}>🧺 Otros ingredientes</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {r.ingredientes_resto?.map((ing,j)=>(
                  <span key={j} style={{fontSize:10,padding:'3px 8px',borderRadius:8,background:C.surfaceAlt,color:C.textSec,fontWeight:600}}>{ing}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:6}}>👨‍🍳 Preparación</div>
              {r.pasos?.map((paso,j)=>(
                <div key={j} style={{display:'flex',gap:8,marginBottom:6}}>
                  <div style={{width:20,height:20,borderRadius:10,background:'#34C759',color:'white',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{j+1}</div>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.5}}>{paso}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {recetas?.error&&<div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{recetas.error}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PLAN NUTRICIONAL ADAPTATIVO PRO
══════════════════════════════════════════════ */
function PlanAdaptativoModal({C, F, dark, nombre, perfil, obj, metas, ritmo, weightHistory, streak, tot, onClose}) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const pesoActual = weightHistory.length>0 ? weightHistory[weightHistory.length-1].w : perfil.peso;
  const pesoHaceUnaSemana = weightHistory.length>=7 ? weightHistory[weightHistory.length-7]?.w : null;
  const cambioPeso = pesoHaceUnaSemana ? (pesoActual - pesoHaceUnaSemana).toFixed(1) : null;
  const progresoEsperado = ritmo==='tranquilo'?-0.25:ritmo==='normal'?-0.5:ritmo==='rapido'?-0.75:-1;
  const estaEnMeta = cambioPeso && Math.abs(parseFloat(cambioPeso)) >= Math.abs(progresoEsperado)*0.7;

  const generarPlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const progreso = cambioPeso
        ? `Esta semana cambió ${cambioPeso}kg (meta: ${progresoEsperado}kg/semana). ${estaEnMeta?'Va bien.':'Necesita ajuste.'}`
        : 'Sin suficiente historial de peso.';

      const prompt = `Crea un plan nutricional adaptativo para ${nombre}.
Objetivo: ${obj==='bajar'?'bajar de peso':obj==='subir'?'ganar músculo':obj==='recomp'?'recomposición corporal':'mantener peso'}.
Peso actual: ${pesoActual}kg. Calorías actuales: ${metas.cal}kcal/día.
Progreso esta semana: ${progreso}
Racha actual: ${streak.days} días. Calorías consumidas hoy: ${Math.round(tot.cal)}kcal.
Ritmo elegido: ${ritmo}.

Basado en este progreso, genera un plan adaptado con ajustes específicos.
Responde SOLO con JSON:
{
  "estado": "en_camino|necesita_ajuste|excelente",
  "mensaje_motivacional": "mensaje personalizado",
  "ajuste_calorias": numero (+ o - respecto a meta actual, puede ser 0),
  "razon_ajuste": "explicación del ajuste",
  "distribucion_macros": {"prot_g": numero, "carbs_g": numero, "grasas_g": numero},
  "estrategias": ["estrategia 1", "estrategia 2", "estrategia 3"],
  "alimentos_clave": [{"nombre": "alimento", "razon": "por qué incluirlo", "emoji": "emoji"}],
  "proxima_revision": "en X días"
}`;

      const data = await callEdgeFn({
        mode:'chat',
        system:'Eres nutricionista deportivo chileno experto. Analizas el progreso real del usuario y propones ajustes concretos con calorías y macros específicos. Los alimentos clave que recomiendas están disponibles en Chile. Responde SOLO JSON válido, sin texto adicional.',
        messages:[{role:'user',content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      setPlan(JSON.parse(jsonMatch[0]));
    } catch(e) {
      setPlan({error:'No se pudo generar el plan. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  const estadoColor = {en_camino:'#FF9500', necesita_ajuste:'#FF3B30', excelente:'#34C759'};
  const estadoEmoji = {en_camino:'📊', necesita_ajuste:'⚠️', excelente:'🎯'};

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>🧬 Plan Adaptativo <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Resumen de progreso */}
        <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>📊 Tu progreso esta semana</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              {label:'Peso actual',val:`${pesoActual}kg`,emoji:'⚖️',color:C.text},
              {label:'Cambio',val:cambioPeso?`${cambioPeso>0?'+':''}${cambioPeso}kg`:'Sin datos',emoji:'📈',color:parseFloat(cambioPeso||0)<0&&obj==='bajar'?'#34C759':C.text},
              {label:'Meta semanal',val:`${progresoEsperado}kg`,emoji:'🎯',color:'#FF9500'},
              {label:'Racha',val:`${streak.days} días`,emoji:'🔥',color:'#D42020'},
            ].map(({label,val,emoji,color})=>(
              <div key={label} style={{background:C.surfaceAlt,borderRadius:14,padding:'10px',textAlign:'center'}}>
                <div style={{fontSize:18,marginBottom:4}}>{emoji}</div>
                <div style={{fontSize:14,fontWeight:800,color}}>{val}</div>
                <div style={{fontSize:10,color:C.textSec,marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={generarPlan} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'linear-gradient(135deg,#5856D6,#AF52DE)',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:14,opacity:loading?0.7:1}}>
          {loading?'🧬 Analizando tu progreso...':'🧬 Generar plan adaptativo'}
        </button>

        {plan&&!plan.error&&(
          <>
            {/* Estado */}
            <div style={{background:`${estadoColor[plan.estado]}18`,borderRadius:18,padding:'16px',marginBottom:12,border:`1.5px solid ${estadoColor[plan.estado]}40`}}>
              <div style={{fontSize:20,marginBottom:6}}>{estadoEmoji[plan.estado]} <span style={{fontSize:14,fontWeight:800,color:estadoColor[plan.estado]}}>{plan.estado==='excelente'?'¡Excelente progreso!':plan.estado==='en_camino'?'Vas bien, ajuste fino':plan.estado==='necesita_ajuste'?'Necesita ajuste':'Analizando...'}</span></div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.5}}>{plan.mensaje_motivacional}</div>
            </div>

            {/* Ajuste de calorías */}
            {plan.ajuste_calorias!==0&&(
              <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>🎯 Ajuste recomendado</div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{fontSize:24,fontWeight:900,color:plan.ajuste_calorias>0?'#34C759':'#FF9500'}}>{plan.ajuste_calorias>0?'+':''}{plan.ajuste_calorias} kcal</div>
                  <div style={{fontSize:12,color:C.textSec,flex:1}}>{plan.razon_ajuste}</div>
                </div>
                <div style={{marginTop:8,fontSize:12,color:C.textSec}}>Nueva meta: <strong style={{color:C.text}}>{metas.cal + plan.ajuste_calorias} kcal/día</strong></div>
              </div>
            )}

            {/* Macros */}
            <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🥗 Distribución óptima de macros</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[['💪','Proteínas',plan.distribucion_macros?.prot_g,'g','#D42020'],['🌾','Carbos',plan.distribucion_macros?.carbs_g,'g','#FF9500'],['🥑','Grasas',plan.distribucion_macros?.grasas_g,'g','#FFD700']].map(([e,l,v,u,c])=>(
                  <div key={l} style={{background:C.surfaceAlt,borderRadius:12,padding:'10px 8px',textAlign:'center'}}>
                    <div style={{fontSize:18}}>{e}</div>
                    <div style={{fontSize:15,fontWeight:800,color:c}}>{v}{u}</div>
                    <div style={{fontSize:10,color:C.textSec}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estrategias */}
            <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>💡 Estrategias para esta semana</div>
              {plan.estrategias?.map((e,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,padding:'8px 10px',background:C.surfaceAlt,borderRadius:10}}>
                  <span style={{color:'#5856D6',fontWeight:700,fontSize:14}}>{i+1}.</span>
                  <span style={{fontSize:12,color:C.text,lineHeight:1.5}}>{e}</span>
                </div>
              ))}
            </div>

            {/* Alimentos clave */}
            {plan.alimentos_clave?.length>0&&(
              <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>🛒 Alimentos clave esta semana</div>
                {plan.alimentos_clave.map((a,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<plan.alimentos_clave.length-1?`1px solid ${C.border}`:'none'}}>
                    <span style={{fontSize:22}}>{a.emoji}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{a.nombre}</div>
                      <div style={{fontSize:11,color:C.textSec}}>{a.razon}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{background:dark?'rgba(88,86,214,0.1)':'rgba(88,86,214,0.06)',borderRadius:14,padding:'10px 14px',border:'1px solid rgba(88,86,214,0.2)'}}>
              <div style={{fontSize:11,color:'#5856D6',fontWeight:600}}>🔄 Próxima revisión: {plan.proxima_revision}</div>
            </div>
          </>
        )}
        {plan?.error&&<div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{plan.error}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PLAN FAMILIAR PRO
══════════════════════════════════════════════ */
function PlanFamiliarModal({C, F, dark, supabaseUser, isPro, onClose}) {
  const [miembros, setMiembros] = useState(()=>LS.get('familia_miembros',[{id:1,nombre:'',edad:'',obj:'mantener',activo:true}]));
  const [tab, setTab] = useState('miembros');

  const agregarMiembro = () => {
    if(miembros.length >= 5) return;
    setMiembros([...miembros,{id:Date.now(),nombre:'',edad:'',obj:'mantener',activo:true}]);
  };

  const actualizarMiembro = (id, campo, valor) => {
    const updated = miembros.map(m=>m.id===id?{...m,[campo]:valor}:m);
    setMiembros(updated);
    LS.set('familia_miembros', updated);
  };

  const eliminarMiembro = (id) => {
    if(miembros.length<=1) return;
    const updated = miembros.filter(m=>m.id!==id);
    setMiembros(updated);
    LS.set('familia_miembros', updated);
  };

  const objLabels = {bajar:'Bajar peso',mantener:'Mantener',subir:'Ganar músculo',recomp:'Recomposición'};

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>👨‍👩‍👧 Plan Familiar <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:14,background:C.surface,borderRadius:14,padding:4,border:`1px solid ${C.border}`}}>
          {[['miembros','👥 Miembros'],['metas','🎯 Metas'],['comidas','🍽️ Plan']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'8px',borderRadius:10,border:'none',background:tab===t?'#D42020':'transparent',color:tab===t?'white':C.textSec,fontFamily:F,cursor:'pointer',fontSize:11,fontWeight:700}}>
              {l}
            </button>
          ))}
        </div>

        {tab==='miembros'&&(
          <>
            <div style={{background:C.surface,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,color:C.textSec}}>Registra hasta 5 miembros de tu familia. Cada uno tendrá sus propias metas calóricas.</div>
            </div>
            {miembros.map((m,i)=>(
              <div key={m.id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>👤 Miembro {i+1}{i===0?' (Tú)':''}</div>
                  {i>0&&<button onClick={()=>eliminarMiembro(m.id)} style={{background:'none',border:'none',color:'#FF3B30',cursor:'pointer',fontSize:16}}>×</button>}
                </div>
                <input value={m.nombre} onChange={e=>actualizarMiembro(m.id,'nombre',e.target.value)} placeholder="Nombre" style={{width:'100%',padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,fontFamily:F,outline:'none',marginBottom:8,boxSizing:'border-box'}}/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <input value={m.edad} onChange={e=>actualizarMiembro(m.id,'edad',e.target.value)} placeholder="Edad" type="number" style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,fontFamily:F,outline:'none'}}/>
                  <select value={m.obj} onChange={e=>actualizarMiembro(m.id,'obj',e.target.value)} style={{padding:'8px 12px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,fontFamily:F,outline:'none'}}>
                    {Object.entries(objLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
            ))}
            {miembros.length<5&&(
              <button onClick={agregarMiembro} style={{width:'100%',padding:'12px',borderRadius:16,border:`2px dashed ${C.border}`,background:'transparent',color:C.textSec,fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:600}}>
                + Agregar miembro ({miembros.length}/5)
              </button>
            )}
          </>
        )}

        {tab==='metas'&&(
          <div>
            {miembros.filter(m=>m.nombre).map((m,i)=>{
              const calEstimadas = m.edad<12?1600:m.edad<18?2200:m.obj==='bajar'?1700:m.obj==='subir'?2800:2000;
              return (
                <div key={m.id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:8}}>👤 {m.nombre} ({m.edad} años)</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:22,fontWeight:900,color:'#D42020'}}>{calEstimadas} kcal</div>
                      <div style={{fontSize:11,color:C.textSec}}>Estimado diario · {objLabels[m.obj]}</div>
                    </div>
                    <div style={{fontSize:28}}>{m.edad<12?'🧒':m.edad<18?'👦':'👤'}</div>
                  </div>
                </div>
              );
            })}
            {!miembros.some(m=>m.nombre)&&(
              <div style={{textAlign:'center',padding:'40px',color:C.textSec}}>
                <div style={{fontSize:40,marginBottom:12}}>👨‍👩‍👧</div>
                <div style={{fontSize:14}}>Agrega miembros en la pestaña anterior</div>
              </div>
            )}
          </div>
        )}

        {tab==='comidas'&&(
          <div style={{background:C.surface,borderRadius:18,padding:'16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>🍽️ Plan de comidas familiar</div>
            <div style={{fontSize:12,color:C.textSec,marginBottom:12}}>Basado en los miembros registrados, aquí una sugerencia de menú familiar:</div>
            {[
              {comida:'☀️ Desayuno',sugerencia:'Avena con frutas + leche + huevos revueltos',cal_adulto:420,cal_nino:280},
              {comida:'🍽️ Almuerzo',sugerencia:'Arroz + pollo al horno + ensalada + legumbres',cal_adulto:680,cal_nino:450},
              {comida:'☕ Once',sugerencia:'Pan integral + palta + jugo natural',cal_adulto:320,cal_nino:250},
              {comida:'🌙 Cena',sugerencia:'Sopa de verduras + pan + quesillo',cal_adulto:380,cal_nino:280},
            ].map((c,i)=>(
              <div key={i} style={{padding:'10px 0',borderBottom:i<3?`1px solid ${C.border}`:'none'}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>{c.comida}</div>
                <div style={{fontSize:12,color:C.textSec,marginBottom:4}}>{c.sugerencia}</div>
                <div style={{display:'flex',gap:10,fontSize:10}}>
                  <span style={{color:'#D42020',fontWeight:700}}>👤 {c.cal_adulto} kcal</span>
                  <span style={{color:'#34C759',fontWeight:700}}>🧒 {c.cal_nino} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PLANES DESCARGABLES PDF (Pro)
══════════════════════════════════════════════ */
function PlanesDescargablesModal({C, F, dark, nombre, perfil, obj, metas, ritmo, userAllergens, veganMode, onClose}) {
  const [loading, setLoading] = useState(false);
  const [planGenerado, setPlanGenerado] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState('4semanas');

  const PLANES = [
    {id:'4semanas', titulo:'Plan 4 semanas', emoji:'📅', desc:'Menú completo día a día por 28 días', duracion:'28 días'},
    {id:'perdida', titulo:'Plan Pérdida de Peso', emoji:'📉', desc:'Protocolo específico para bajar de peso de forma saludable', duracion:'21 días'},
    {id:'volumen', titulo:'Plan Ganancia Muscular', emoji:'💪', desc:'Plan para maximizar la ganancia de masa muscular', duracion:'30 días'},
    {id:'detox', titulo:'Plan Detox Chileno', emoji:'🥗', desc:'Reset nutricional con alimentos chilenos naturales', duracion:'7 días'},
  ];

  const generarPlan = async () => {
    setLoading(true);
    setPlanGenerado(null);
    try {
      const plan = PLANES.find(p=>p.id===planSeleccionado);
      const alerg = userAllergens.length>0?`Alergias: ${userAllergens.join(', ')}.`:'';
      const vegan = veganMode?'VEGANO.':'';
      const objTexto = {bajar:'perder peso',mantener:'mantener peso',subir:'ganar músculo',recomp:'recomposición'}[obj];

      const prompt = `Crea un ${plan.titulo} para ${nombre}. Objetivo: ${objTexto}. Calorías: ${metas.cal}kcal. ${alerg} ${vegan}
Ingredientes de supermercados chilenos. Duración: ${plan.duracion}.
Responde SOLO con JSON:
{
  "titulo": "${plan.titulo} - ${nombre}",
  "duracion": "${plan.duracion}",
  "objetivo": "${objTexto}",
  "calorias_diarias": ${metas.cal},
  "semanas": [
    {
      "semana": 1,
      "enfoque": "descripción del enfoque",
      "dias": [
        {
          "dia": "Lunes",
          "desayuno": "nombre + descripción breve",
          "almuerzo": "nombre + descripción breve",
          "once": "nombre + descripción breve",
          "cena": "nombre + descripción breve",
          "cal_total": numero
        }
      ]
    }
  ],
  "consejos_generales": ["consejo 1", "consejo 2", "consejo 3"],
  "lista_compras_semanal": ["item 1", "item 2", "item 3"]
}
Incluye solo la semana 1 detallada para mantener el JSON manejable.`;

      const data = await callEdgeFn({
        mode:'chat',
        system:'Eres nutricionista chileno experto. Creas planes de alimentación con comidas típicas chilenas reales (cazuela, arroz con pollo, ensalada chilena, etc.) e ingredientes de supermercados chilenos. Las calorías deben sumar aproximadamente la meta indicada. Responde SOLO JSON válido, sin texto adicional.',
        messages:[{role:'user',content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      setPlanGenerado(JSON.parse(jsonMatch[0]));
    } catch(e) {
      setPlanGenerado({error:'No se pudo generar el plan. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  const descargarPlan = () => {
    if(!planGenerado||planGenerado.error) return;
    // Generar contenido del plan como texto
    let contenido = `═══════════════════════════════════
`;
    contenido += `${planGenerado.titulo}
`;
    contenido += `═══════════════════════════════════

`;
    contenido += `Objetivo: ${planGenerado.objetivo}
`;
    contenido += `Duración: ${planGenerado.duracion}
`;
    contenido += `Calorías diarias: ${planGenerado.calorias_diarias} kcal

`;
    contenido += `─── SEMANA 1 ───

`;
    planGenerado.semanas?.[0]?.dias?.forEach(d=>{
      contenido += `📅 ${d.dia}
`;
      contenido += `  ☀️ Desayuno: ${d.desayuno}
`;
      contenido += `  🍽️ Almuerzo: ${d.almuerzo}
`;
      contenido += `  ☕ Once: ${d.once}
`;
      contenido += `  🌙 Cena: ${d.cena}
`;
      contenido += `  Total: ~${d.cal_total} kcal

`;
    });
    contenido += `─── LISTA DE COMPRAS ───

`;
    planGenerado.lista_compras_semanal?.forEach(i=>{ contenido += `• ${i}
`; });
    contenido += `
─── CONSEJOS ───

`;
    planGenerado.consejos_generales?.forEach((c,i)=>{ contenido += `${i+1}. ${c}
`; });
    contenido += `
─────────────────────────────────
`;
    contenido += `Generado por Calorú Pro 🇨🇱
`;
    contenido += `caloru.cl
`;

    // Descargar como .txt
    const blob = new Blob([contenido], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planGenerado.titulo.replace(/\s+/g,'_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>📄 Planes Descargables <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        <div style={{marginBottom:14}}>
          {PLANES.map(p=>(
            <div key={p.id} onClick={()=>setPlanSeleccionado(p.id)} style={{
              background:C.surface,borderRadius:16,padding:'12px 14px',marginBottom:8,
              border:`2px solid ${planSeleccionado===p.id?'#D42020':C.border}`,
              cursor:'pointer',display:'flex',alignItems:'center',gap:12,
            }}>
              <span style={{fontSize:28,flexShrink:0}}>{p.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.titulo}</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:2}}>{p.desc}</div>
                <div style={{fontSize:10,color:'#D42020',fontWeight:700,marginTop:2}}>📅 {p.duracion}</div>
              </div>
              <div style={{width:22,height:22,borderRadius:11,border:`2px solid ${planSeleccionado===p.id?'#D42020':C.border}`,background:planSeleccionado===p.id?'#D42020':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {planSeleccionado===p.id&&<span style={{color:'white',fontSize:12,fontWeight:800}}>✓</span>}
              </div>
            </div>
          ))}
        </div>

        <button onClick={generarPlan} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:10,opacity:loading?0.7:1}}>
          {loading?'🤖 Generando tu plan personalizado...':'🤖 Generar plan con IA'}
        </button>

        {planGenerado&&!planGenerado.error&&(
          <>
            <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:4}}>✅ {planGenerado.titulo}</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:10}}>{planGenerado.duracion} · {planGenerado.calorias_diarias} kcal/día</div>
              {planGenerado.semanas?.[0]?.dias?.slice(0,3).map((d,i)=>(
                <div key={i} style={{padding:'8px 0',borderBottom:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#D42020',marginBottom:4}}>{d.dia}</div>
                  <div style={{fontSize:11,color:C.textSec}}>☀️ {d.desayuno?.split('+')[0]?.trim()}</div>
                  <div style={{fontSize:11,color:C.textSec}}>🍽️ {d.almuerzo?.split('+')[0]?.trim()}</div>
                </div>
              ))}
              <div style={{fontSize:11,color:C.textMuted,marginTop:6,textAlign:'center'}}>... y más días en el archivo descargado</div>
            </div>
            <button onClick={descargarPlan} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'#34C759',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              📥 Descargar plan completo (.txt)
            </button>
          </>
        )}
        {planGenerado?.error&&<div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{planGenerado.error}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MARKETPLACE NUTRICIONISTAS
══════════════════════════════════════════════ */
function MarketplaceNutricionistasModal({C, F, dark, onClose, supabaseUser}) {
  const NUTRICIONISTAS = [
    {id:1,nombre:'Catalina Morales',esp:'Nutrición deportiva',rating:4.9,reviews:127,precio:15000,disponible:true,emoji:'👩‍⚕️',tag:'🏆 Top rated'},
    {id:2,nombre:'Diego Fuentes',esp:'Pérdida de peso',rating:4.8,reviews:89,precio:12000,disponible:true,emoji:'👨‍⚕️',tag:'🔥 Popular'},
    {id:3,nombre:'Valentina Ríos',esp:'Nutrición vegana',rating:4.9,reviews:64,precio:13000,disponible:false,emoji:'👩‍⚕️',tag:'🌱 Vegana'},
    {id:4,nombre:'Andrés Castillo',esp:'Diabetes y metabolismo',rating:4.7,reviews:112,precio:18000,disponible:true,emoji:'👨‍⚕️',tag:'🏥 Especialista'},
    {id:5,nombre:'Isidora Parra',esp:'Nutrición pediátrica',rating:4.8,reviews:93,precio:14000,disponible:true,emoji:'👩‍⚕️',tag:'👶 Infantil'},
  ];

  const [seleccionado, setSeleccionado] = useState(null);
  const [localToast, setLocalToast] = useState('');
  const showToast = (msg) => { setLocalToast(msg); setTimeout(()=>setLocalToast(''),3500); };
  const [showAgendar, setShowAgendar] = useState(false);

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      {localToast&&<div style={{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'#333',color:'white',padding:'10px 20px',borderRadius:12,fontSize:13,zIndex:10001,maxWidth:300,textAlign:'center'}}>{localToast}</div>}
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>🏥 Nutricionistas</div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:16}}>
        <div style={{background:'linear-gradient(135deg,#34C759,#30D158)',borderRadius:18,padding:'14px 16px',marginBottom:14,color:'white'}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>👩‍⚕️ Consulta con un profesional</div>
          <div style={{fontSize:11,opacity:0.9}}>Nutricionistas chilenos certificados. Consulta online vía videollamada.</div>
        </div>

        {NUTRICIONISTAS.map(n=>(
          <div key={n.id} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1.5px solid ${seleccionado===n.id?'#34C759':C.border}`,cursor:'pointer'}} onClick={()=>setSeleccionado(seleccionado===n.id?null:n.id)}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <div style={{width:48,height:48,borderRadius:16,background:n.disponible?'#34C75920':'#D4202020',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>{n.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{n.nombre}</div>
                  <span style={{fontSize:9,fontWeight:700,background:n.disponible?'#34C75920':'#D4202020',color:n.disponible?'#34C759':'#D42020',padding:'2px 6px',borderRadius:6}}>{n.disponible?'Disponible':'Ocupado'}</span>
                </div>
                <div style={{fontSize:11,color:C.textSec,marginBottom:4}}>{n.esp}</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:11,color:'#FFD700',fontWeight:700}}>⭐ {n.rating}</span>
                  <span style={{fontSize:10,color:C.textMuted}}>({n.reviews} reseñas)</span>
                  <span style={{fontSize:11,fontWeight:800,color:'#34C759',marginLeft:'auto'}}>${n.precio.toLocaleString('es-CL')}</span>
                </div>
                <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>por consulta (45 min)</div>
              </div>
            </div>
            {n.tag&&<div style={{marginTop:6,display:'inline-block',fontSize:10,fontWeight:700,background:C.surfaceAlt,color:C.textSec,padding:'3px 8px',borderRadius:8}}>{n.tag}</div>}

            {seleccionado===n.id&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,color:C.textSec,marginBottom:10}}>Selecciona horario para agendar tu consulta online:</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                  {['Hoy 15:00','Hoy 17:00','Mañana 10:00','Mañana 14:00','Mañana 16:00'].map(h=>(
                    <button key={h} style={{padding:'6px 10px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:11,fontFamily:F,cursor:'pointer',fontWeight:600}}>{h}</button>
                  ))}
                </div>
                <button onClick={()=>showToast('¡Próximamente! Esta función estará disponible cuando lancemos el marketplace oficial.')} style={{width:'100%',padding:'11px',borderRadius:14,border:'none',background:'#34C759',color:'white',fontFamily:F,cursor:'pointer',fontSize:13,fontWeight:700}}>
                  📅 Agendar consulta — ${n.precio.toLocaleString('es-CL')}
                </button>
              </div>
            )}
          </div>
        ))}

        <div style={{background:dark?'rgba(52,199,89,0.08)':'rgba(52,199,89,0.05)',borderRadius:14,padding:'12px 14px',border:'1px solid rgba(52,199,89,0.2)'}}>
          <div style={{fontSize:11,color:'#34C759',fontWeight:700,marginBottom:4}}>💡 ¿Eres nutricionista?</div>
          <div style={{fontSize:11,color:C.textSec,marginBottom:4}}>Suscríbete por <strong>$9.990/mes</strong> y tus pacientes obtienen Calorú Pro automáticamente. Ellos pueden reembolsarlo por Isapre o Fonasa.</div>
          <button onClick={async()=>{
            if(!supabaseUser){showToast('Inicia sesión para registrarte.');return;}
            try{
              const session=await supabase.auth.getSession();
              const token=session.data.session?.access_token;
              const res=await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/create-subscription',{
                method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                body:JSON.stringify({plan:'nutricionista',back_url:'https://caloru.cl'}),
              });
              const data=await res.json();
              if(data.init_point) window.location.href=data.init_point;
              else showToast('Error al crear la suscripción. Intenta de nuevo.');
            }catch{showToast('Error de conexión. Intenta de nuevo.');}
          }} style={{marginTop:8,padding:'8px 16px',borderRadius:10,border:'none',background:'#34C759',color:'white',fontFamily:F,cursor:'pointer',fontSize:11,fontWeight:700}}>
            Suscribirme — $9.990/mes
          </button>
        </div>
      </div>
    </div>
  );
}
function PaywallModal({C, F, dark, onClose, supabaseUser}) {
  const [loading, setLoading] = useState(false);
  const [localToast, setLocalToast] = useState('');
  const showToast = (msg) => { setLocalToast(msg); setTimeout(()=>setLocalToast(''),3500); };

  // Detectar si estamos dentro de un TWA (Android app de Google Play)
  // La detección precisa requiere que el referrer incluya el package name de la app
  const isTWA = document.referrer.startsWith('android-app://cl.caloru.app') ||
    (window.matchMedia('(display-mode: standalone)').matches &&
     /android/i.test(navigator.userAgent) &&
     typeof window.getDigitalGoodsService !== 'undefined');

  // Google Play Billing via Digital Goods API
  const handleGooglePlayBilling = async (plan) => {
    const skuMap = {
      monthly: 'caloru_pro_monthly',
      yearly:  'caloru_pro_yearly',
    };
    const sku = skuMap[plan];
    try {
      // Verificar que Digital Goods API esté disponible (TWA con Play Billing)
      if (!window.getDigitalGoodsService) throw new Error('Digital Goods API no disponible');
      const service = await window.getDigitalGoodsService('https://play.google.com/billing');
      const details = await service.getDetails([sku]);
      if (!details || details.length === 0) throw new Error('Producto no encontrado en Play Store');
      const item = details[0];
      // Iniciar el flujo de pago de Play Store
      const paymentRequest = new PaymentRequest(
        [{ supportedMethods: 'https://play.google.com/billing', data: { sku: item.itemId } }],
        { total: { label: item.title, amount: { currency: item.price.currency, value: '0' } } }
      );
      const paymentResponse = await paymentRequest.show();
      const purchaseToken = paymentResponse.details.purchaseToken;
      // Verificar la compra en Google Play via Edge Function (JWT requerido)
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const verifyRes = await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/verify-play-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ purchaseToken, sku, plan }),
      });
      if (!verifyRes.ok) {
        await paymentResponse.complete('fail');
        throw new Error('No se pudo verificar la compra con Google Play');
      }
      await paymentResponse.complete('success');
      showToast('✅ ¡Suscripción activada! Recarga la app para disfrutar Calorú Pro.');
      setTimeout(onClose, 2000);
    } catch(e) {
      console.error('Play Billing error:', e);
      showToast('Error al procesar el pago. Intenta de nuevo.');
    }
  };

  const handleSubscribe = async (plan) => {
    if (!supabaseUser) { showToast('Debes iniciar sesión para suscribirte.'); return; }
    setLoading(true);
    try {
      // En Android TWA → Google Play Billing
      if (isTWA && window.getDigitalGoodsService) {
        await handleGooglePlayBilling(plan);
        setLoading(false);
        return;
      }
      // En web/iOS → Mercado Pago
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan, user_email: supabaseUser.email, back_url: 'https://caloru.cl' }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        showToast('Error al crear la suscripción. Intenta de nuevo.');
      }
    } catch(e) {
      showToast('Error de conexión. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9999,display:'flex',alignItems:'flex-end',justifyContent:'center'}}
      onClick={onClose}>
      {localToast&&<div style={{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:'#333',color:'white',padding:'10px 20px',borderRadius:12,fontSize:13,zIndex:10001,maxWidth:300,textAlign:'center'}}>{localToast}</div>}
      <div onClick={e=>e.stopPropagation()} style={{
        background:C.surface,
        borderRadius:'24px 24px 0 0',
        width:'100%',
        maxWidth:480,
        fontFamily:F,
        maxHeight:'88vh',
        display:'flex',
        flexDirection:'column',
        paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        {/* Handle bar */}
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px'}}>
          <div style={{width:36,height:4,borderRadius:2,background:dark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)'}}/>
        </div>

        {/* Cabecera fija */}
        <div style={{textAlign:'center',padding:'8px 20px 14px'}}>
          <div style={{fontSize:38,marginBottom:6}}>⭐</div>
          <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:4}}>Calorú Pro</div>
          <div style={{fontSize:13,color:C.textSec}}>Desbloquea todas las funciones premium</div>
        </div>

        {/* Lista scrolleable */}
        <div style={{flex:1,overflowY:'auto',padding:'0 20px',WebkitOverflowScrolling:'touch'}}>
          <div style={{background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',borderRadius:16,padding:'10px 14px',marginBottom:16}}>
            {['🤖 Asistente IA nutricional','📸 Escáner de platos con IA','🧠 IA con memoria de preferencias','📊 Micronutrientes detallados','🇨🇱 Recetas chilenas con IA','🍂 Recetas de temporada económicas','🛒 Lista de compras inteligente','📅 Plan semanal automático','📉 Predicción de peso','👥 Liga con amigos','🏥 Modo diabetes/hipertensión','🌙 Modo fin de semana relajado','🧬 Plan nutricional adaptativo','👨‍👩‍👧 Plan familiar (5 miembros)','📄 Planes descargables personalizados','📤 Exportar datos CSV','📅 Historial de 90 días'].map((f,i,arr)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:i<arr.length-1?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:15}}>{f.split(' ')[0]}</span>
                <span style={{fontSize:13,color:C.text,fontWeight:500}}>{f.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones fijos abajo */}
        <div style={{padding:'12px 20px 16px',borderTop:`1px solid ${C.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            <button onClick={()=>handleSubscribe('monthly')} disabled={loading} style={{padding:'14px 10px',borderRadius:16,border:'2px solid #D42020',background:'transparent',color:'#D42020',fontFamily:F,cursor:'pointer',fontWeight:700,fontSize:13}}>
              <div style={{fontSize:18,marginBottom:2}}>📅</div>
              <div>Mensual</div>
              <div style={{fontSize:16,fontWeight:800,marginTop:2}}>$3.500 CLP</div>
              <div style={{fontSize:10,color:C.textSec,marginTop:1}}>/ mes</div>
            </button>
            <button onClick={()=>handleSubscribe('yearly')} disabled={loading} style={{padding:'14px 10px',borderRadius:16,border:'2px solid #D42020',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontWeight:700,fontSize:13,position:'relative'}}>
              <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#FFD700',color:'#000',fontSize:9,fontWeight:800,padding:'2px 8px',borderRadius:8,whiteSpace:'nowrap'}}>AHORRA 30%</div>
              <div style={{fontSize:18,marginBottom:2}}>🗓️</div>
              <div>Anual</div>
              <div style={{fontSize:16,fontWeight:800,marginTop:2}}>$29.900 CLP</div>
              <div style={{fontSize:10,opacity:0.8,marginTop:1}}>/ año</div>
            </button>
          </div>
          <button onClick={onClose} style={{width:'100%',padding:'13px',borderRadius:14,border:`1px solid ${C.border}`,background:'transparent',color:C.textSec,fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:600}}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}

function MicronutrientesModal({C, F, log, onClose}) {
  const totals = log.reduce((acc, item) => {
    const factor = (item.grams ? item.grams / (item.porcion || 100) : 1) * (item.qty || 1);
    acc.fibra   += (item.fibra   || 0) * factor;
    acc.azucar  += (item.azucar  || 0) * factor;
    acc.sodio   += (item.sodio   || 0) * factor;
    acc.prot    += (item.prot    || 0) * factor;
    acc.grasas  += (item.grasas  || 0) * factor;
    acc.carbs   += (item.carbs   || 0) * factor;
    return acc;
  }, {fibra:0, azucar:0, sodio:0, prot:0, grasas:0, carbs:0});

  const metas = {fibra:25, azucar:50, sodio:2300, prot:50, grasas:65, carbs:300};
  const items = [
    {label:'Proteínas',    val:totals.prot,   meta:metas.prot,   unit:'g',  emoji:'💪', color:'#D42020'},
    {label:'Carbohidratos',val:totals.carbs,  meta:metas.carbs,  unit:'g',  emoji:'🌾', color:'#FF9500'},
    {label:'Grasas',       val:totals.grasas, meta:metas.grasas, unit:'g',  emoji:'🥑', color:'#FFD700'},
    {label:'Fibra',        val:totals.fibra,  meta:metas.fibra,  unit:'g',  emoji:'🥦', color:'#34C759'},
    {label:'Azúcar',       val:totals.azucar, meta:metas.azucar, unit:'g',  emoji:'🍬', color:'#FF2D55'},
    {label:'Sodio',        val:totals.sodio,  meta:metas.sodio,  unit:'mg', emoji:'🧂', color:'#5856D6'},
  ];

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📊 Micronutrientes <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {log.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',color:C.textSec}}>
            <div style={{fontSize:48,marginBottom:12}}>🥗</div>
            <div style={{fontSize:15,fontWeight:600,color:C.text}}>Sin registros hoy</div>
            <div style={{fontSize:13,marginTop:6}}>Agrega comidas para ver tus micronutrientes</div>
          </div>
        ) : (
          <>
            <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:16,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:13,color:C.textSec,marginBottom:4}}>Resumen de hoy vs metas recomendadas</div>
              <div style={{fontSize:11,color:C.textMuted}}>Basado en valores diarios recomendados para adultos</div>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:C.text,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Macronutrientes</div>
            {items.map(({label,val,meta,unit,emoji,color})=>{
              const pct = Math.min(100, Math.round((val/meta)*100));
              const over = val > meta;
              return (
                <div key={label} style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:20}}>{emoji}</span>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:C.text}}>{label}</div>
                        <div style={{fontSize:11,color:C.textSec}}>Meta: {meta}{unit}</div>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:16,fontWeight:800,color:over?'#FF3B30':color}}>{Math.round(val)}{unit}</div>
                      <div style={{fontSize:10,color:over?'#FF3B30':C.textSec,fontWeight:600}}>{pct}% {over?'⚠️ excedido':'completado'}</div>
                    </div>
                  </div>
                  <div style={{height:8,background:C.surfaceAlt,borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:over?'#FF3B30':color,borderRadius:4,transition:'width .5s ease'}}/>
                  </div>
                </div>
              );
            })}
            {/* Vitaminas y minerales (reales + estimados) */}
            {(()=>{
              const mic = sumMicros(log);
              return (<>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',margin:'18px 0 10px'}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.text,textTransform:'uppercase',letterSpacing:.5}}>Vitaminas y minerales</div>
                  {mic._anyEst&&<span style={{fontSize:9,color:C.textMuted}}>~ algunos estimados</span>}
                </div>
                <div style={{background:C.surface,borderRadius:18,padding:'14px 16px',border:`1px solid ${C.border}`}}>
                  {MICROS.map((x,i)=>{
                    const v=mic[x.k]||0; const pct=Math.min(Math.round((v/x.rda)*100),100);
                    const col=pct>=70?'#34C759':pct>=35?'#FF9500':'#FF3B30';
                    return (
                      <div key={x.k} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<MICROS.length-1?11:0}}>
                        <span style={{fontSize:15,width:20,flexShrink:0}}>{x.e}</span>
                        <div style={{width:104,fontSize:12.5,color:C.text,fontWeight:600,flexShrink:0}}>{x.l}</div>
                        <div style={{flex:1,height:7,borderRadius:4,background:C.surfaceAlt,overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',background:col,borderRadius:4}}/>
                        </div>
                        <div style={{width:74,textAlign:'right',fontSize:12,fontWeight:700,color:C.text,flexShrink:0}}>{v>=100?Math.round(v):v.toFixed(1)}<span style={{fontSize:9,color:C.textSec}}>{x.u}</span></div>
                      </div>
                    );
                  })}
                  <div style={{fontSize:10,color:C.textMuted,marginTop:12,textAlign:'center',lineHeight:1.4}}>% no mostrado por simplicidad · objetivo: acercarte al 100% del valor diario.<br/>Datos reales para alimentos comunes; el resto estimado por categoría.</div>
                </div>
              </>);
            })()}
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RECETAS CHILENAS IA PRO
══════════════════════════════════════════════ */
function RecetasIAModal({C, F, dark, nombre, perfil, obj, onClose, userAllergens=[], veganMode=false}) {
  const [loading, setLoading] = useState(false);
  const [receta, setReceta] = useState(null);
  const [preferencia, setPreferencia] = useState('almuerzo');
  const [restriccion, setRestriccion] = useState('ninguna');

  const generarReceta = async () => {
    setLoading(true);
    setReceta(null);
    try {
      const objTexto = {bajar:'bajar de peso',mantener:'mantener peso',subir:'ganar músculo'}[obj]||'mantener peso';
      const alergiasTexto = userAllergens.length>0 ? `Alergias/intolerancias: ${userAllergens.join(', ')}.` : '';
      const veganoTexto = veganMode ? 'La persona es VEGANA, no usar ningún producto animal.' : '';
      const prompt = `Genera una receta chilena saludable para ${preferencia} para una persona que quiere ${objTexto}. Restricción elegida: ${restriccion}. ${alergiasTexto} ${veganoTexto}
Responde SOLO en este formato JSON exacto:
{
  "nombre": "nombre de la receta",
  "emoji": "emoji representativo",
  "tiempo": "tiempo de preparación",
  "porciones": número,
  "calorias": número por porción,
  "ingredientes": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "pasos": ["paso 1", "paso 2", "paso 3"],
  "tip": "tip nutricional chileno",
  "macros": {"prot": número, "carbs": número, "grasas": número}
}`;
      const data = await callEdgeFn({
        mode: 'chat',
        system: 'Eres un chef nutricionista chileno experto. Generas recetas sabrosas y nutritivas con ingredientes reales de Chile disponibles en Jumbo, Lider y Santa Isabel. Los macros que calculas son precisos y basados en los ingredientes indicados. Responde SOLO con JSON válido, sin texto adicional.',
        messages: [{role:'user', content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      setReceta(JSON.parse(jsonMatch[0]));
    } catch(e) {
      console.error('RecetaIA error:', e);
      setReceta({error: 'No se pudo generar la receta. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>🇨🇱 Recetas IA <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        <div style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>¿Qué quieres preparar?</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
            {['desayuno','almuerzo','once','cena','snack','merienda'].map(p=>(
              <button key={p} onClick={()=>setPreferencia(p)} style={{padding:'8px 4px',borderRadius:12,border:`1.5px solid ${preferencia===p?'#D42020':C.border}`,background:preferencia===p?'#D4202018':C.surfaceAlt,color:preferencia===p?'#D42020':C.text,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,textTransform:'capitalize'}}>
                {p}
              </button>
            ))}
          </div>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>Restricción alimentaria</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {['ninguna','vegetariana','vegana','sin gluten','sin lactosa','bajo en sodio'].map(r=>(
              <button key={r} onClick={()=>setRestriccion(r)} style={{padding:'8px',borderRadius:12,border:`1.5px solid ${restriccion===r?'#D42020':C.border}`,background:restriccion===r?'#D4202018':C.surfaceAlt,color:restriccion===r?'#D42020':C.text,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F,textTransform:'capitalize'}}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generarReceta} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:8,opacity:loading?0.7:1}}>
          {loading?'🤖 Generando receta...':'🇨🇱 Generar receta chilena'}
        </button>
        {(userAllergens.length>0||veganMode)&&(
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:16,padding:'8px 12px',background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:12,border:'1px solid rgba(52,199,89,0.3)'}}>
            <span style={{fontSize:14}}>✅</span>
            <span style={{fontSize:11,color:'#34C759',fontWeight:600}}>
              Receta adaptada a tu perfil: {[veganMode&&'vegano',...userAllergens].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {receta&&!receta.error&&(
          <div style={{background:C.surface,borderRadius:18,padding:'18px',border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <span style={{fontSize:36}}>{receta.emoji}</span>
              <div>
                <div style={{fontSize:17,fontWeight:800,color:C.text}}>{receta.nombre}</div>
                <div style={{fontSize:12,color:C.textSec,marginTop:2}}>⏱️ {receta.tiempo} · 🍽️ {receta.porciones} porciones · 🔥 {receta.calorias} kcal/porción</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:14}}>
              {[['💪','Prot',receta.macros?.prot,'g'],['🌾','Carbs',receta.macros?.carbs,'g'],['🥑','Grasas',receta.macros?.grasas,'g']].map(([e,l,v,u])=>(
                <div key={l} style={{background:C.surfaceAlt,borderRadius:12,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:18}}>{e}</div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>{v}{u}</div>
                  <div style={{fontSize:10,color:C.textSec}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>🛒 Ingredientes</div>
              {receta.ingredientes?.map((ing,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:'#D42020',fontWeight:700,fontSize:12}}>•</span>
                  <span style={{fontSize:13,color:C.text}}>{ing}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:8}}>👨‍🍳 Preparación</div>
              {receta.pasos?.map((paso,i)=>(
                <div key={i} style={{display:'flex',gap:10,marginBottom:8}}>
                  <div style={{width:22,height:22,borderRadius:11,background:'#D42020',color:'white',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <span style={{fontSize:13,color:C.text,lineHeight:1.5}}>{paso}</span>
                </div>
              ))}
            </div>
            {receta.tip&&(
              <div style={{background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:14,padding:'12px',border:'1px solid rgba(52,199,89,0.3)'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#34C759',marginBottom:4}}>💡 Tip nutricional</div>
                <div style={{fontSize:13,color:C.text}}>{receta.tip}</div>
              </div>
            )}
          </div>
        )}
        {receta?.error&&(
          <div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{receta.error}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LISTA DE COMPRAS INTELIGENTE PRO
══════════════════════════════════════════════ */
function ListaComprasIAModal({C, F, dark, log, onClose, userAllergens=[], veganMode=false}) {
  const [loading, setLoading] = useState(false);
  const [lista, setLista] = useState(null);
  const [checked, setChecked] = useState({});
  const generarLista = async () => {
    setLoading(true);
    setLista(null);
    setChecked({});
    try {
      const alimentos = log.map(it=>it.nombre).join(', ') || 'variado saludable';
      const alergiasTexto = userAllergens.length>0 ? `IMPORTANTE: el usuario tiene alergias/intolerancias a: ${userAllergens.join(', ')}. Excluir estos ingredientes de la lista.` : '';
      const veganoTexto = veganMode ? 'IMPORTANTE: el usuario es VEGANO. Incluir solo productos de origen vegetal, sin carnes, lácteos, huevos ni miel.' : '';
      const prompt = `Basado en estos alimentos que consume el usuario: ${alimentos}
${alergiasTexto}
${veganoTexto}
Genera una lista de compras saludable para una semana en Chile (supermercados chilenos como Jumbo, Lider, Santa Isabel).
Responde SOLO con este JSON:
{
  "categorias": [
    {
      "nombre": "nombre categoría",
      "emoji": "emoji",
      "items": ["item 1 con cantidad", "item 2 con cantidad"]
    }
  ],
  "presupuesto_estimado": "rango en CLP",
  "tip": "consejo de compra"
}`;
      const data = await callEdgeFn({
        mode: 'chat',
        system: 'Eres un nutricionista chileno. Generas listas de compras realistas con productos disponibles en Jumbo, Lider y Santa Isabel. Incluyes marcas chilenas conocidas (Soprole, Colún, Carozzi, Super Pollo, Fruna, Watts, La Crianza). El presupuesto estimado es en CLP reales y razonable para Chile 2025. Responde SOLO con JSON válido.',
        messages: [{role:'user', content:prompt}],
      });
      const text = data.text || data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error('No JSON: ' + text.substring(0,100));
      setLista(JSON.parse(jsonMatch[0]));
    } catch(e) {
      console.error('ListaCompras error:', e);
      setLista({error:'No se pudo generar la lista. Intenta de nuevo.'});
    }
    setLoading(false);
  };

  const toggleItem = (key) => setChecked(prev=>({...prev,[key]:!prev[key]}));

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      <div style={{...modalHeaderStyle(C),display:'flex',alignItems:'center'}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>🛒 Lista de Compras IA <span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,fontWeight:800}}>PRO ⭐</span></div>
        <div style={{minWidth:80}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        <div style={{background:C.surface,borderRadius:18,padding:'14px',marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,color:C.textSec}}>Basada en tus alimentos del día y hábitos registrados. La IA genera una lista personalizada para supermercados chilenos.</div>
        </div>
        <button onClick={generarLista} disabled={loading} style={{width:'100%',padding:'14px',borderRadius:16,border:'none',background:'#34C759',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:F,marginBottom:8,opacity:loading?0.7:1}}>
          {loading?'🤖 Generando lista...':'🛒 Generar lista inteligente'}
        </button>
        {(userAllergens.length>0||veganMode)&&(
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:16,padding:'8px 12px',background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:12,border:'1px solid rgba(52,199,89,0.3)'}}>
            <span style={{fontSize:14}}>✅</span>
            <span style={{fontSize:11,color:'#34C759',fontWeight:600}}>
              Lista adaptada a tu perfil: {[veganMode&&'vegano',...userAllergens].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        {lista&&!lista.error&&(
          <>
            {lista.presupuesto_estimado&&(
              <div style={{background:dark?'rgba(52,199,89,0.1)':'rgba(52,199,89,0.08)',borderRadius:14,padding:'12px 14px',marginBottom:12,border:'1px solid rgba(52,199,89,0.3)',display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>💰</span>
                <div>
                  <div style={{fontSize:11,color:'#34C759',fontWeight:700}}>Presupuesto estimado</div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>{lista.presupuesto_estimado}</div>
                </div>
              </div>
            )}
            {lista.categorias?.map((cat,ci)=>(
              <div key={ci} style={{background:C.surface,borderRadius:18,padding:'14px 16px',marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:10}}>{cat.emoji} {cat.nombre}</div>
                {cat.items?.map((item,ii)=>{
                  const key=`${ci}-${ii}`;
                  return (
                    <div key={ii} onClick={()=>toggleItem(key)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:ii<cat.items.length-1?`1px solid ${C.border}`:'none',cursor:'pointer'}}>
                      <div style={{width:22,height:22,borderRadius:11,border:`2px solid ${checked[key]?'#34C759':'#D42020'}`,background:checked[key]?'#34C759':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}>
                        {checked[key]&&<span style={{color:'white',fontSize:12,fontWeight:800}}>✓</span>}
                      </div>
                      <span style={{fontSize:13,color:C.text,textDecoration:checked[key]?'line-through':'none',opacity:checked[key]?0.5:1,transition:'all .2s'}}>{item}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            {lista.tip&&(
              <div style={{background:dark?'rgba(255,149,0,0.1)':'rgba(255,149,0,0.08)',borderRadius:14,padding:'12px',border:'1px solid rgba(255,149,0,0.3)',marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:'#FF9500',marginBottom:4}}>💡 Consejo de compra</div>
                <div style={{fontSize:13,color:C.text}}>{lista.tip}</div>
              </div>
            )}
          </>
        )}
        {lista?.error&&(
          <div style={{textAlign:'center',padding:'20px',color:'#FF3B30',fontSize:14}}>{lista.error}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MODO FERIA — Optimizador nutricional-económico
   Genera plan semanal basado en presupuesto en CLP
═══════════════════════════════════════════════════════ */
const generarPlanFeria = (presupuesto, metas, db, prefs = {}) => {
  const { veganMode=false, allergens=[], favIds=new Set(), recentIds=new Set(), obj='mantener', condicion='ninguna', condiciones=null } = prefs;
  const conds = Array.isArray(condiciones)&&condiciones.length ? condiciones : (condicion&&condicion!=='ninguna'?[condicion]:[]);

  // Solo productos con precio definido
  let conPrecio = db.filter(f => f.precio && f.pesoCompra);

  // Filtrar por modo vegano
  if(veganMode) conPrecio = conPrecio.filter(f => isVegan(f));

  // Filtrar alérgenos del usuario
  if(allergens.length) conPrecio = conPrecio.filter(f => !getFoodAllergens(f).some(a => allergens.includes(a)));

  // Filtrar para hipertensión (bajo sodio: < 400mg/100g)
  if(conds.includes('hipertension')) conPrecio = conPrecio.filter(f => ((f.sodio||0)/(f.porcion||100))*100 < 400);

  // Filtrar para diabetes (bajo azúcar: < 15g/100g)
  if(conds.includes('diabetes')) conPrecio = conPrecio.filter(f => ((f.azucar||0)/(f.porcion||100))*100 < 15);

  // Filtrar para colesterol (baja grasa saturada / grasas: priorizar < 10g grasa/100g)
  if(conds.includes('colesterol')) conPrecio = conPrecio.filter(f => ((f.grasas||0)/(f.porcion||100))*100 < 12);

  // Filtrar para celiaquía (sin gluten)
  if(conds.includes('celiaco')) conPrecio = conPrecio.filter(f => !getFoodAllergens(f).includes('gluten'));

  // Calcular valor nutricional por peso (score) con preferencias
  const scored = conPrecio.map(f => {
    const factor = 100 / (f.porcion || 100);
    const prot100 = (f.prot || 0) * factor;
    const cal100  = (f.cal  || 0) * factor;
    const precio100g = (f.precio / f.pesoCompra) * 100;
    // Score según objetivo
    let score = 0;
    if(precio100g > 0) {
      if(obj === 'bajar')      score = (prot100 * 5 - cal100 * 0.1) / precio100g;
      else if(obj === 'subir') score = (prot100 * 3 + cal100 * 1.5) / precio100g;
      else                     score = (prot100 * 3 + cal100) / precio100g;
    }
    // Boost por favoritos y recientes
    if(favIds.has(f.id))    score *= 1.5;
    if(recentIds.has(f.id)) score *= 1.2;
    return { ...f, prot100, cal100, precio100g, score };
  });

  // Ordenar por score descendente (más nutrición por peso)
  scored.sort((a, b) => b.score - a.score);

  const lista = [];
  let gastado = 0;
  const protSemanal = (metas.prot || 50) * 7;
  const calSemanal  = (metas.cal  || 2000) * 7;
  let protAcum = 0;
  let calAcum  = 0;

  // Selección greedy con variedad (máx 3 unidades por producto)
  for (const food of scored) {
    if (gastado >= presupuesto) break;
    const maxUnidades = Math.min(
      Math.floor((presupuesto - gastado) / food.precio),
      3
    );
    if (maxUnidades < 1) continue;

    // ¿Cuántas unidades necesitamos para la proteína?
    const protPorUnidad = (food.prot100 / 100) * food.pesoCompra;
    const unidadesNecesarias = protPorUnidad > 0
      ? Math.ceil(Math.max(0, protSemanal - protAcum) / protPorUnidad)
      : 1;
    const unidades = Math.min(maxUnidades, Math.max(1, unidadesNecesarias));

    lista.push({
      ...food,
      unidades,
      costoTotal: food.precio * unidades,
      protTotal: Math.round(protPorUnidad * unidades),
      calTotal:  Math.round((food.cal100 / 100) * food.pesoCompra * unidades),
    });
    gastado  += food.precio * unidades;
    protAcum += protPorUnidad * unidades;
    calAcum  += (food.cal100 / 100) * food.pesoCompra * unidades;
  }

  return {
    lista,
    gastado,
    vuelto: presupuesto - gastado,
    protSemanal: Math.round(protAcum),
    calSemanal:  Math.round(calAcum),
    protMeta:    protSemanal,
    calMeta:     calSemanal,
  };
};

const calcPrediccionSemanal = (db) => {
  const logs = []; const dias = [];
  for(let i = 1; i <= 28; i++) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dayLog = LS.get('log_'+key,[]);
    if(dayLog.length){ logs.push(...dayLog.map(l=>({...l,_day:key}))); dias.push(key); }
  }
  if(dias.length < 3) return null;

  // Frecuencia por food id
  const freq = {};
  logs.forEach(item=>{ const k=String(item.id); freq[k]=(freq[k]||0)+1; });

  // Top 6 más comidos
  const topFoods = Object.entries(freq)
    .sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([id,cnt])=>{
      const food = db.find(f=>String(f.id)===id) || logs.find(l=>String(l.id)===id);
      return food ? {...food, frecuencia:cnt} : null;
    }).filter(Boolean);

  // Calorías promedio diaria
  const totalCal = logs.reduce((s,item)=>{
    const r=(item.grams?item.grams/(item.porcion||100):1)*(item.qty||1);
    return s+(item.cal||0)*r;
  },0);
  const avgCal = Math.round(totalCal/dias.length);

  // Comida más frecuente por tipo de comida
  const byMeal = {};
  logs.forEach(item=>{
    if(!item.comida) return;
    if(!byMeal[item.comida]) byMeal[item.comida]={};
    const k=String(item.id); byMeal[item.comida][k]=(byMeal[item.comida][k]||0)+1;
  });
  const topByMeal = {};
  Object.entries(byMeal).forEach(([meal,foods])=>{
    const topId=Object.entries(foods).sort((a,b)=>b[1]-a[1])[0]?.[0];
    const food=topId?(db.find(f=>String(f.id)===topId)||logs.find(l=>String(l.id)===topId)):null;
    if(food) topByMeal[meal]=food;
  });

  // Tendencia: ¿las calorías de los últimos 7 días vs los 7 anteriores?
  const cal7 = []; const cal7prev = [];
  for(let i=1;i<=7;i++){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dLog=LS.get('log_'+key,[]);
    const c=dLog.reduce((s,it)=>s+(it.cal||0)*((it.grams?it.grams/(it.porcion||100):1)*(it.qty||1)),0);
    cal7.push(c);
  }
  for(let i=8;i<=14;i++){
    const d=new Date(); d.setDate(d.getDate()-i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const dLog=LS.get('log_'+key,[]);
    const c=dLog.reduce((s,it)=>s+(it.cal||0)*((it.grams?it.grams/(it.porcion||100):1)*(it.qty||1)),0);
    cal7prev.push(c);
  }
  const avgReciente=Math.round(cal7.reduce((s,c)=>s+c,0)/7);
  const avgPrevio=Math.round(cal7prev.reduce((s,c)=>s+c,0)/7);
  const tendencia = avgReciente > avgPrevio+50 ? 'subiendo' : avgReciente < avgPrevio-50 ? 'bajando' : 'estable';

  return { topFoods, avgCal, avgReciente, tendencia, diasAnalizados:dias.length, topByMeal };
};

function ModFeriaModal({C, F, metas, onClose, veganMode=false, userAllergens=[], favorites=[], recent=[], obj='mantener', condicion='ninguna', condiciones=null, nombre=''}) {
  const [presupuesto, setPresupuesto] = useState(15000);
  const [plan, setPlan] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [tab, setTab] = useState('feria'); // 'feria' | 'prediccion'
  const prediccion = useMemo(()=>calcPrediccionSemanal(DB),[]);
  const conds = Array.isArray(condiciones)&&condiciones.length ? condiciones : (condicion&&condicion!=='ninguna'?[condicion]:[]);

  const generar = () => {
    setGenerando(true);
    setTimeout(() => {
      const favIds   = new Set(favorites.map(f=>f.id));
      const recentIds = new Set(recent.map(f=>f.id));
      setPlan(generarPlanFeria(presupuesto, metas, DB, {
        veganMode, allergens:userAllergens, favIds, recentIds, obj, condicion, condiciones
      }));
      setGenerando(false);
    }, 600);
  };

  const formatCLP = (n) => '$' + Math.round(n).toLocaleString('es-CL');

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:9999,display:'flex',flexDirection:'column',fontFamily:F,paddingTop:'env(safe-area-inset-top)'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',padding:'14px 16px',borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:C.textSec,padding:'0 8px 0 0'}}>‹</button>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>🛒 Modo Feria</div>
          <div style={{fontSize:11,color:C.textSec}}>Come sano. Gasta inteligente.</div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:'flex',background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'0 16px'}}>
        {[{k:'feria',label:'🛒 Mi compra'},{k:'prediccion',label:'🔮 Predicción'}].map(({k,label})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            flex:1,padding:'10px 0',border:'none',background:'none',cursor:'pointer',fontFamily:F,
            fontSize:13,fontWeight:700,color:tab===k?'#D42020':C.textSec,
            borderBottom:tab===k?'2px solid #D42020':'2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:16}}>

        {/* ── TAB PREDICCIÓN ── */}
        {tab==='prediccion' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            {!prediccion ? (
              <div style={{textAlign:'center',padding:'60px 20px',color:C.textSec}}>
                <div style={{fontSize:48,marginBottom:12}}>🔮</div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>Aún no hay suficientes datos</div>
                <div style={{fontSize:13,marginTop:8,lineHeight:1.5}}>Registra tus comidas al menos 3 días para que Calorú pueda predecir tus patrones.</div>
              </div>
            ) : (
              <>
                {/* Resumen de hábitos */}
                <div style={{background:'linear-gradient(135deg,#5856D6,#AF52DE)',borderRadius:18,padding:'16px',marginBottom:16,color:'white'}}>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:4}}>🔮 Basado en tus últimos {prediccion.diasAnalizados} días</div>
                  <div style={{fontSize:24,fontWeight:800}}>{prediccion.avgReciente} kcal</div>
                  <div style={{fontSize:11,opacity:.85}}>promedio diario reciente · tendencia {prediccion.tendencia==='subiendo'?'📈 subiendo':prediccion.tendencia==='bajando'?'📉 bajando':'➡️ estable'}</div>
                </div>

                {/* Alimentos más frecuentes */}
                <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>🍽️ Lo que más comes</div>
                {prediccion.topFoods.map((f,i)=>(
                  <div key={i} style={{background:C.surface,borderRadius:14,padding:'10px 14px',marginBottom:8,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:24,flexShrink:0}}>{f.emoji||'🍽️'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>{f.nombre}</div>
                      <div style={{fontSize:11,color:C.textSec}}>{f.cal} kcal · {f.prot}g prot · {f.frecuencia}x en {prediccion.diasAnalizados} días</div>
                    </div>
                    <div style={{background:i===0?'#D4202015':C.surfaceAlt,borderRadius:8,padding:'3px 8px'}}>
                      <span style={{fontSize:11,fontWeight:700,color:i===0?'#D42020':C.textSec}}>#{i+1}</span>
                    </div>
                  </div>
                ))}

                {/* Predicción por comida del día */}
                {Object.keys(prediccion.topByMeal).length > 0 && (
                  <>
                    <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10,marginTop:16}}>⏰ Tus patrones por comida</div>
                    {['Desayuno','Almuerzo','Once','Cena','Snack'].map(meal=>{
                      const f=prediccion.topByMeal[meal];
                      if(!f) return null;
                      const icons={'Desayuno':'🌅','Almuerzo':'☀️','Once':'🫖','Cena':'🌙','Snack':'🍎'};
                      return(
                        <div key={meal} style={{background:C.surface,borderRadius:14,padding:'10px 14px',marginBottom:8,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
                          <span style={{fontSize:20}}>{icons[meal]}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,color:C.textSec,fontWeight:600}}>{meal}</div>
                            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{f.nombre}</div>
                          </div>
                          <span style={{fontSize:20}}>{f.emoji||'🍽️'}</span>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Sugerencia inteligente */}
                <div style={{background:'rgba(88,86,214,0.08)',borderRadius:14,padding:'12px 14px',marginTop:8,border:'1px solid rgba(88,86,214,0.2)'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#5856D6',marginBottom:4}}>💡 Sugerencia de Calorú</div>
                  <div style={{fontSize:11,color:C.textSec,lineHeight:1.5}}>
                    {prediccion.tendencia==='subiendo'
                      ? 'Tus calorías están subiendo esta semana. Considera usar Modo Feria para planificar con más proteína y menos calorías vacías.'
                      : prediccion.tendencia==='bajando'
                      ? 'Tus calorías están bajando. Asegúrate de comer suficiente — usa Modo Feria para cubrir tus metas con tu presupuesto.'
                      : 'Tus hábitos están estables. Usa Modo Feria para optimizar lo que gastas en comida esta semana.'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB MODO FERIA ── */}
        {tab==='feria' && <>
        {/* Indicadores de personalización activos */}
        {(veganMode || userAllergens.length > 0 || conds.length > 0) && (
          <div style={{background:'rgba(52,199,89,0.08)',border:'1px solid rgba(52,199,89,0.2)',borderRadius:12,padding:'8px 12px',marginBottom:12,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{fontSize:10,fontWeight:700,color:'#34C759'}}>✓ Personalizado para ti:</span>
            {veganMode && <span style={{fontSize:10,background:'#34C75920',color:'#34C759',padding:'2px 8px',borderRadius:8,fontWeight:600}}>🌱 Vegano</span>}
            {conds.includes('diabetes') && <span style={{fontSize:10,background:'#FF950020',color:'#FF9500',padding:'2px 8px',borderRadius:8,fontWeight:600}}>🩺 Bajo azúcar</span>}
            {conds.includes('hipertension') && <span style={{fontSize:10,background:'#5856D620',color:'#5856D6',padding:'2px 8px',borderRadius:8,fontWeight:600}}>💊 Bajo sodio</span>}
            {conds.includes('colesterol') && <span style={{fontSize:10,background:'#FF2D5520',color:'#FF2D55',padding:'2px 8px',borderRadius:8,fontWeight:600}}>🫀 Baja grasa</span>}
            {conds.includes('celiaco') && <span style={{fontSize:10,background:'#C8960A20',color:'#C8960A',padding:'2px 8px',borderRadius:8,fontWeight:600}}>🌾 Sin gluten</span>}
            {userAllergens.length>0 && <span style={{fontSize:10,background:'#FF3B3020',color:'#FF3B30',padding:'2px 8px',borderRadius:8,fontWeight:600}}>⚠️ Sin alérgenos</span>}
          </div>
        )}

        {/* Banner explicativo */}
        <div style={{background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:18,padding:'16px',marginBottom:16,color:'white'}}>
          <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>🇨🇱 Único en Chile</div>
          <div style={{fontSize:12,opacity:.9,lineHeight:1.4}}>Ingresa tu presupuesto semanal y Calorú te dice exactamente qué comprar en el Líder o Jumbo para cumplir tus metas de nutrición al menor costo posible.</div>
        </div>

        {/* Selector de presupuesto */}
        <div style={{background:C.surface,borderRadius:16,padding:'16px',marginBottom:16,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>¿Cuánto tienes para gastar en comida esta semana?</div>
          <div style={{fontSize:32,fontWeight:800,color:'#D42020',textAlign:'center',marginBottom:12}}>{formatCLP(presupuesto)}</div>
          <input
            type="range"
            min={5000} max={80000} step={1000}
            value={presupuesto}
            onChange={e => setPresupuesto(+e.target.value)}
            style={{width:'100%',accentColor:'#D42020',marginBottom:8}}
          />
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.textMuted}}>
            <span>$5.000</span><span>$80.000</span>
          </div>
          {/* Atajos rápidos */}
          <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
            {[10000,15000,20000,30000,50000].map(v=>(
              <button key={v} onClick={()=>setPresupuesto(v)} style={{
                padding:'6px 12px',borderRadius:20,border:`1.5px solid ${presupuesto===v?'#D42020':C.border}`,
                background:presupuesto===v?'#D4202015':'transparent',
                color:presupuesto===v?'#D42020':C.textSec,
                fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              }}>{formatCLP(v)}</button>
            ))}
          </div>
        </div>

        {/* Botón generar */}
        <button onClick={generar} disabled={generando} style={{
          width:'100%',padding:'16px',borderRadius:18,border:'none',
          background:generando?'#C7C7CC':'#D42020',color:'white',
          fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:F,marginBottom:16,
        }}>
          {generando ? '🛒 Buscando los mejores precios...' : '🛒 Generar mi plan de compras'}
        </button>

        {/* Resultados */}
        {plan && (
          <div style={{animation:'fadeUp .3s ease'}}>
            {/* Resumen */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
              {[
                {label:'Gastado',value:formatCLP(plan.gastado),color:'#D42020'},
                {label:'Vuelto',value:formatCLP(plan.vuelto),color:'#34C759'},
                {label:'Proteína',value:`${plan.protSemanal}g`,color:'#007AFF'},
              ].map(({label,value,color})=>(
                <div key={label} style={{background:C.surface,borderRadius:14,padding:'12px 8px',textAlign:'center',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:16,fontWeight:800,color}}>{value}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Barra de progreso proteína */}
            <div style={{background:C.surface,borderRadius:16,padding:'14px',marginBottom:16,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,color:C.text}}>💪 Proteína semanal</span>
                <span style={{fontSize:12,color:C.textSec}}>{plan.protSemanal}g / {plan.protMeta}g meta</span>
              </div>
              <div style={{background:C.surfaceAlt,borderRadius:8,height:10,overflow:'hidden'}}>
                <div style={{width:`${Math.min(100,Math.round(plan.protSemanal/plan.protMeta*100))}%`,height:'100%',background:'#007AFF',borderRadius:8,transition:'width .5s ease'}}/>
              </div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>
                {plan.protSemanal >= plan.protMeta ? '✅ Meta de proteína cubierta' : `⚠️ Faltan ${plan.protMeta - plan.protSemanal}g de proteína`}
              </div>
            </div>

            {/* Lista de compras */}
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:10}}>🛍️ Lista de compras</div>
            {plan.lista.map((item,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:14,padding:'12px 14px',marginBottom:8,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontSize:28,flexShrink:0}}>{item.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec}}>{item.unidades > 1 ? `${item.unidades} unidades` : '1 unidad'} · {item.protTotal}g prot · {item.calTotal} kcal</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#D42020'}}>{formatCLP(item.costoTotal)}</div>
                  <div style={{fontSize:10,color:C.textMuted}}>{formatCLP(item.precio)}/u</div>
                </div>
              </div>
            ))}

            {/* Dato diferenciador */}
            <div style={{background:'rgba(212,32,32,0.08)',borderRadius:14,padding:'12px 14px',marginTop:8,border:'1px solid rgba(212,32,32,0.15)'}}>
              <div style={{fontSize:12,fontWeight:700,color:'#D42020',marginBottom:4}}>🇨🇱 Solo en Calorú</div>
              <div style={{fontSize:11,color:C.textSec,lineHeight:1.5}}>Este plan usa precios reales de supermercados chilenos. Ninguna otra app de nutrición en español hace esto.</div>
            </div>
          </div>
        )}
        </>}
      </div>
    </div>
  );
}

/* ─── Mi Pauta (vista del paciente: pauta + adherencia) ─── */
function MiPautaModal({C, F, dark, nutriPlan, tot, metas, onClose}){
  const norm = normalizeRecs(nutriPlan?.recomendaciones);
  const mac = norm.macros||{};
  const calTarget   = nutriPlan?.calorias_meta || metas.cal || 0;
  const protTarget  = mac.prot  ?? metas.prot;
  const carbTarget  = mac.carbs ?? metas.carbs;
  const grasaTarget = mac.grasas?? metas.grasas;

  const dayK = todayKey();
  const [checks,setChecks] = React.useState(()=>LS.get('pautaCheck_'+dayK, {}));
  const toggle = (k)=>{ const n={...checks,[k]:!checks[k]}; setChecks(n); LS.set('pautaCheck_'+dayK,n); haptic('light'); };

  // Estado de adherencia de un valor vs su meta
  const adh = (cur, target) => {
    if(!target) return {label:'Sin meta', color:C.textMuted, p:0};
    const p = cur/target;
    if(p>=0.9 && p<=1.1) return {label:'En meta', color:'#34C759', p:Math.min(p,1)};
    if(p<0.9)  return {label:`Faltan ${Math.round(target-cur)}`, color:'#FF9500', p};
    return {label:`+${Math.round(cur-target)} de más`, color:'#FF3B30', p:1};
  };
  const calAdh = adh(tot.cal, calTarget);

  const comidas = norm.comidas||[];
  const totalComidas = comidas.length;
  const hechas = comidas.filter(c=>checks[c.comida]).length;
  const cumplPct = totalComidas>0 ? Math.round((hechas/totalComidas)*100) : 0;

  const Bar = ({cur, target, color}) => (
    <div style={{height:7,borderRadius:4,background:dark?'rgba(255,255,255,0.1)':'#E5E5EA',overflow:'hidden'}}>
      <div style={{width:`${target>0?Math.min((cur/target)*100,100):0}%`,height:'100%',background:color,borderRadius:4,transition:'width .3s'}}/>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:C.bg,zIndex:95,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
      <div style={modalHeaderStyle(C)}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>👩‍⚕️ Mi pauta</div>
        <div style={{minWidth:70}}/>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {/* Nutricionista + mensaje */}
        <div style={{background:'#1D355710',borderRadius:18,padding:'12px 14px',marginBottom:14,border:'1px solid #1D355730'}}>
          <div style={{fontSize:13,fontWeight:800,color:'#1D3557'}}>{nutriPlan?.nutricionista_nombre||'Tu nutricionista'}</div>
          {nutriPlan?.mensaje&&<div style={{fontSize:12,color:'#1D3557',lineHeight:1.5,fontStyle:'italic',marginTop:4}}>"{nutriPlan.mensaje}"</div>}
        </div>

        {/* Adherencia de hoy */}
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Tu progreso de hoy</div>
        <div style={{background:C.surface,borderRadius:18,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
          {/* Calorías */}
          <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>Calorías</span>
            <span style={{fontSize:12,fontWeight:700,color:calAdh.color}}>{Math.round(tot.cal)} / {calTarget} kcal · {calAdh.label}</span>
          </div>
          <Bar cur={tot.cal} target={calTarget} color={calAdh.color}/>
          {/* Macros */}
          <div style={{display:'flex',gap:10,marginTop:14}}>
            {[{l:'Proteínas',cur:tot.prot,t:protTarget,c:'#34C759'},{l:'Carbohid.',cur:tot.carbs,t:carbTarget,c:'#FF9500'},{l:'Lípidos',cur:tot.grasas,t:grasaTarget,c:'#5856D6'}].map(({l,cur,t,c})=>{
              const a=adh(cur,t);
              return (
                <div key={l} style={{flex:1}}>
                  <div style={{fontSize:10,color:C.textSec,fontWeight:600,marginBottom:3}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:4}}>{Math.round(cur)}<span style={{fontSize:9,color:C.textSec}}>/{t||'—'}g</span></div>
                  <Bar cur={cur} target={t} color={a.color}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pauta por comida con check */}
        {totalComidas>0&&(
          <>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5}}>Pauta de comidas</div>
              <div style={{fontSize:12,fontWeight:800,color:cumplPct>=100?'#34C759':cumplPct>0?'#FF9500':C.textMuted}}>{hechas}/{totalComidas} ✓ ({cumplPct}%)</div>
            </div>
            {comidas.map((c,ci)=>{
              const meta = PAUTA_COMIDAS.find(m=>m.k===c.comida)||{icon:'🍽️',color:'#8E8E93'};
              const done = !!checks[c.comida];
              return (
                <div key={ci} style={{background:C.surface,borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1.5px solid ${done?'#34C759':C.border}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:(c.items||[]).length?8:0}}>
                    <span style={{fontSize:15}}>{meta.icon}</span>
                    <span style={{fontSize:13,fontWeight:800,color:meta.color}}>{c.comida}</span>
                    {c.hora&&<span style={{fontSize:11,fontWeight:700,color:meta.color,background:meta.color+'18',borderRadius:8,padding:'2px 8px'}}>🕐 {c.hora}</span>}
                    <button onClick={()=>toggle(c.comida)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,border:`1.5px solid ${done?'#34C759':C.border}`,background:done?'#34C75915':'transparent',borderRadius:10,padding:'5px 10px',cursor:'pointer',fontFamily:F}}>
                      <span style={{width:16,height:16,borderRadius:5,background:done?'#34C759':'transparent',border:`2px solid ${done?'#34C759':C.border}`,color:'#fff',fontSize:11,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{done?'✓':''}</span>
                      <span style={{fontSize:11,fontWeight:700,color:done?'#34C759':C.textSec}}>{done?'Cumplido':'Marcar'}</span>
                    </button>
                  </div>
                  {(c.items||[]).map((it,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'3px 0',borderTop:i>0?`1px solid ${C.border}`:'none'}}>
                      <span style={{fontSize:12.5,color:C.text}}>{it.tipo}</span>
                      <span style={{fontSize:11,color:C.textSec,fontWeight:600}}>{it.porcion}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
        {totalComidas===0&&(
          <div style={{fontSize:12,color:C.textMuted,textAlign:'center',padding:'20px 0',lineHeight:1.5}}>
            Tu nutricionista aún no cargó una pauta de comidas detallada.<br/>Sigue tus metas de calorías y macros de arriba.
          </div>
        )}
      </div>
    </div>
  );
}

function AppCore({onRequestAuth}) {
  const [splash,setSplash]     = useState(true);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [authChecked, setAuthChecked]  = useState(false);
  const [syncStatus, setSyncStatus]    = useState('idle');
  const [restoringData, setRestoringData] = useState(false);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const syncTimer = useRef(null);
  const [isPro, setIsPro] = useState(false);
  const [proSource, setProSource] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(''); // '' | 'free' | 'pro' | 'nutricionista'
  const [showPaywall, setShowPaywall] = useState(false);
  const [showMicronutrientes, setShowMicronutrientes] = useState(false);
  const [showRecetasIA, setShowRecetasIA] = useState(false);
  const [showListaComprasIA, setShowListaComprasIA] = useState(false);
  const [showPredicionPeso, setShowPredicionPeso] = useState(false);
  const [showModoSalud, setShowModoSalud] = useState(false);
  const [showReporteSemanal, setShowReporteSemanal] = useState(false);
  const [showRecordatorios, setShowRecordatorios] = useState(false);

  /* Service Worker ya se registra en index.html — no duplicar aquí */

  /* ── Cargar estado de suscripción ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    supabase.from('profiles').select('subscription_status,subscription_expires_at,linked_nutricionista_id,linked_nutricionista_nombre').eq('id',supabaseUser.id).single()
      .then(({data})=>{
        if(data){
          const bySub = (data.subscription_status==='pro'||data.subscription_status==='nutricionista') && (!data.subscription_expires_at || new Date(data.subscription_expires_at)>new Date());
          const byNutri = !!data.linked_nutricionista_id;
          setIsPro(bySub || byNutri);
          setSubscriptionStatus(data.subscription_status||'free');
          if(byNutri && data.linked_nutricionista_nombre) setProSource('nutricionista:'+data.linked_nutricionista_nombre);
          // Refrescar el plan del nutricionista por si actualizó mensaje/metas/recomendaciones
          if(byNutri && supabaseUser.email){
            supabase.from('nutrition_plans')
              .select('id,paciente_id,calorias_meta,mensaje,recomendaciones,objetivo')
              .eq('nutricionista_id', data.linked_nutricionista_id)
              .eq('paciente_email', supabaseUser.email.toLowerCase())
              .limit(1).maybeSingle()
              .then(({data:plan})=>{
                if(plan){
                  const fresh = {
                    nutricionista_nombre: data.linked_nutricionista_nombre,
                    calorias_meta: plan.calorias_meta||null,
                    mensaje: plan.mensaje||null,
                    recomendaciones: plan.recomendaciones||[],
                  };
                  setNutriPlan(fresh); LS.set('nutriPlan', fresh);
                  // Auto-reclamar el plan si aún no estaba reclamado (auto-sana
                  // pacientes que se vincularon antes del fix de políticas) y
                  // registra actividad para que el panel del nutri se actualice.
                  if(!plan.paciente_id){
                    supabase.from('nutrition_plans')
                      .update({paciente_id:supabaseUser.id, ultima_actividad:new Date().toISOString()})
                      .eq('id', plan.id).then(()=>{},()=>{});
                  }
                }
              }, ()=>{});
          }
        }
      });
  },[supabaseUser?.id]);

  /* ── Detector de conexión ── */
  useEffect(()=>{
    const on  = ()=>setIsOnline(true);
    const off = ()=>setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    // En Android WebView/TWA navigator.onLine puede reportar false por error
    // en el arranque en frío. Re-chequeamos a los 2s para no dejar al usuario
    // atrapado en la pantalla "Sin conexión" cuando sí hay internet.
    const recheck = setTimeout(()=>{ if(navigator.onLine) setIsOnline(true); }, 2000);
    return ()=>{ clearTimeout(recheck); window.removeEventListener('online',on); window.removeEventListener('offline',off); };
  },[]);

  /* ── Auth listener ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const [onboarded,setOnboarded] = useState(()=>LS.get('onboarded',false));
  const [nombre,setNombre]     = useState(()=>LS.get('nombre',''));
  const [perfil,setPerfil]     = useState(()=>LS.get('perfil',{peso:70,altura:170,edad:25,sexo:'M',act:'1.55',condicion:'ninguna'}));
  const [customMetas,setCustomMetas] = useState(()=>LS.get('customMetas',null));
  const [userAllergens,setUserAllergens] = useState(()=>LS.get('allergens',[]));
  const [veganMode,setVeganMode]       = useState(()=>LS.get('veganMode',false));
  const [sinCalorias,setSinCalorias]   = useState(()=>LS.get('sinCalorias',false));
  const [accountType,setAccountType]   = useState(()=>LS.get('accountType','personal'));
  const [proMode,setProMode]           = useState(()=>LS.get('proMode','professional')); // 'professional' | 'personal' — switch del profesional
  const [pacientes,setPacientes]       = useState([]);
  const [loadingPacientes,setLoadingPacientes] = useState(false);
  const [nutriPlan,setNutriPlan]       = useState(()=>LS.get('nutriPlan',null));
  const [nutriCode,setNutriCode]       = useState('');
  const [loadingNutriCode,setLoadingNutriCode] = useState(false);
  const [weightHistory,setWeightHistory] = useState(()=>LS.get('weightHistory',[]));
  const [obj,setObj]           = useState(()=>LS.get('obj','mantener'));
  const [ritmo,setRitmo]       = useState(()=>LS.get('ritmo','normal'));
  const [modoFinde,setModoFinde] = useState(()=>LS.get('modoFinde',false));
  const [showPlanSemanal, setShowPlanSemanal] = useState(false);
  const [showQueComer, setShowQueComer] = useState(false);
  const [showDesafiosComunidad, setShowDesafiosComunidad] = useState(false);
  const [showLigaAmigos, setShowLigaAmigos] = useState(false);
  const [showRecetasTemporada, setShowRecetasTemporada] = useState(false);
  const [showPlanAdaptativo, setShowPlanAdaptativo] = useState(false);
  const [showPlanFamiliar, setShowPlanFamiliar] = useState(false);
  const [showPlanesDescargables, setShowPlanesDescargables] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [autoTheme,setAutoTheme] = useState(()=>LS.get('autoTheme', true));
  const [dark,setDark]         = useState(()=>{
    const auto=LS.get('autoTheme',true);
    if(auto){ const h=new Date().getHours(); return h>=20||h<7; }
    const saved=LS.get('darkMode',null);
    if(saved!==null) return saved;
    return false;
  });
  const [tab,setTab]           = useState(0);
  const [prevTab,setPrevTab]   = useState(0);
  const tabAnim = tab===prevTab?'anim':tab>prevTab?'anim-right':'anim-left';
  const mainRef = useRef(null);
  const goTab = (i) => {
    setPrevTab(tab); setTab(i); haptic('tab');
    setTimeout(()=>mainRef.current?.scrollTo({top:0,behavior:'smooth'}),50);
  };
  const [currentDay,setCurrentDay] = useState(()=>todayKey());
  const [toast,setToast]       = useState('');
  const [log,setLog]           = useState(()=>LS.get('log_'+todayKey(),[]) );
  const [agua,setAgua]         = useState(()=>LS.get('agua_'+todayKey(),0));
  const [waterGoal,setWaterGoal] = useState(()=>LS.get('waterGoal',8));
  const [meal,setMeal]         = useState('Desayuno');
  const [q,setQ]               = useState('');
  const [cat,setCat]           = useState('Todas');
  const [recent,setRecent]     = useState(()=>LS.get('recentFoods',[]));
  const [weights,setWeights]   = useState(()=>LS.get('weights',[]));
  const [newWeight,setNewWeight] = useState('');
  const [streak,setStreak]     = useState(()=>LS.get('streak',{days:0,last:''}));
  const [xpTotal,setXpTotal]   = useState(()=>LS.get('xpTotal',0));
  const [xpHoy,setXpHoy]       = useState(()=>LS.get('xpHoy_'+todayKey(),0));
  const [iaMemoria,setIaMemoria] = useState(()=>LS.get('iaMemoria',{gustos:[],disgustos:[],patrones:[],ultimaActualizacion:''}));
  const [expanded,setExpand]        = useState(null);
  const [editingItem,setEditingItem] = useState(null); // uid of item being edited
  const [searchSort,setSearchSort]  = useState('default');
  const [searchMaxCal,setSearchMaxCal] = useState(0);
  const [showFilter,setShowFilter]  = useState(false);
  const [showHistory,setShowHistory] = useState(false);
  const [historyDay,setHistoryDay]   = useState(null);
  const [editDayKey,setEditDayKey]   = useState(null);
  const [showMiPauta,setShowMiPauta] = useState(false);
  const [showWeekly,setShowWeekly]   = useState(false);
  const [showShare,setShowShare]     = useState(false);
  const [pendingAchievement,setPendingAchievement] = useState(null); // {key, nombre, valor}
  const [avatar,setAvatar]           = useState(()=>LS.get('avatar','🧑'));
  const [showAvatarPicker,setShowAvatarPicker] = useState(false);
  const [photoUrl,setPhotoUrl]         = useState(()=>LS.get('photoUrl',''));
  const [uploadingPhoto,setUploadingPhoto] = useState(false);
  const [bannerIdx,setBannerIdx]         = useState(0);
  const [logrosVis,setLogrosVis]         = useState(()=>LS.get('logrosVis',{}));
  const [showLogroUnlock,setShowLogroUnlock] = useState(null); // {icon,titulo,desc,xp}
  const [showLegal,setShowLegal]               = useState(null);
  const [editName,setEditName]       = useState(false);
  const [tempName,setTempName]       = useState('');
  const [detailFood,setDetail] = useState(null);
  const [exercises,setExercises] = useState(()=>LS.get('ex_'+todayKey(),[]));
  const [customFoods,setCustomFoods] = useState(()=>LS.get('customFoods',[]));
  const [favorites,setFavorites]   = useState(()=>LS.get('favorites',[]));
  const [dayNote,setDayNote]       = useState(()=>LS.get('note_'+todayKey(),''));
  const [dayPhoto,setDayPhoto]     = useState('');
  const [weekData,setWeekData]     = useState([]);
  const [showExSheet,setShowEx]    = useState(false);
  const [confetti,setConfetti]     = useState(false);
  const [nutribotHappy,setNutribotHappy] = useState(false);

  // Vestidor: el usuario puede elegir un outfit fijo o dejarlo en automático
  const [botOutfitChoice,setBotOutfitChoice] = useState(()=>LS.get('botOutfit','auto'));
  const [showOutfitPicker,setShowOutfitPicker] = useState(false);
  // Auto-outfit: cambia según contexto del usuario (solo si la elección es 'auto')
  const nutribotOutfit = useMemo(()=>{
    if(botOutfitChoice && botOutfitChoice!=='auto') return botOutfitChoice;
    const mes = new Date().getMonth(); // 0-based, 8 = septiembre
    if(mes===8||mes===9) return 'huaso';          // Fiestas Patrias sept-oct
    if(mes===11) return 'navidad';                 // Diciembre — Navidad
    if(isPro) return 'crown';                      // Suscriptores Pro
    if(streak.days>=30) return 'llama';            // Racha épica 30+ días
    if(streak.days>=7) return 'sport';             // Racha 7+ días
    return 'chef';                                 // Default: nutricionista
  },[isPro, streak.days, botOutfitChoice]);
  const [notifEnabled,setNotifEnabled] = useState(()=>LS.get('notif',false));
  const [lastPct,setLastPct]       = useState(0);
  const [newAchiev,setNewAchiev]   = useState(null);
  const [showAI,setShowAI]         = useState(false);
  const [showMilestone,setShowMilestone] = useState(null); // milestone key or null
  const [showWelcomeBack,setShowWelcomeBack] = useState(false);
  const [daysAway,setDaysAway] = useState(0);
  const [showRestaurant,setShowRestaurant] = useState(false);
  const [showChallenge,setShowChallenge]   = useState(false);
  const [showAllLogros,setShowAllLogros]   = useState(false);
  const [showHerramientasPro,setShowHerramientasPro] = useState(false);
  const [perfilSubTab,setPerfilSubTab]     = useState(0);
  const [moodEntries,setMoodEntries]       = useState(()=>LS.get('mood_'+todayKey(),[]));
  const [showMoodModal,setShowMoodModal]   = useState(false);
  const [moodDraft,setMoodDraft]           = useState(null);
  const [moodNote,setMoodNote]             = useState('');
  const [comuna,setComuna]                 = useState(()=>LS.get('comuna',''));
  const [showCustom,setShowCustom] = useState(false);
  const [showScanner,setShowScanner] = useState(false);
  const [showModFeria,setShowModFeria] = useState(false);
  const [showPhotoScanner,setShowPhotoScanner] = useState(false);
  const [showRecipe,setShowRecipe]   = useState(false);
  const [showPlanner,setShowPlanner] = useState(false);
  const [fastStart,setFastStart]   = useState(()=>LS.get('fastStart',null));
  const [fastGoal,setFastGoal]     = useState(()=>LS.get('fastGoal',16));
  const [fastNow,setFastNow]       = useState(Date.now());
  const [dailyInsight,setDailyInsight] = useState(()=>LS.get('insight_'+todayKey(),''));
  const [insightLoading,setInsightLoading] = useState(false);
  const [macroDetail,setMacroDetail] = useState(null);

  const C = dark ? DARK : LIGHT;
  const accent = (OBJ_ACCENT[obj]||OBJ_ACCENT.mantener)[dark?'dark':'light'];

  /* ── persist ── */
  useEffect(()=>{LS.set('log_'+todayKey(),log);},[log]);
  useEffect(()=>{LS.set('agua_'+todayKey(),agua);},[agua]);
  useEffect(()=>{LS.set('mood_'+todayKey(),moodEntries);},[moodEntries]);
  useEffect(()=>{LS.set('comuna',comuna);},[comuna]);
  useEffect(()=>{LS.set('perfil',perfil);},[perfil]);
  useEffect(()=>{LS.set('obj',obj);},[obj]);
  useEffect(()=>{LS.set('ritmo',ritmo);},[ritmo]);
  useEffect(()=>{LS.set('modoFinde',modoFinde);},[modoFinde]);
  useEffect(()=>{LS.set('dark',dark);},[dark]);
  useEffect(()=>{LS.set('nombre',nombre);},[nombre]);
  useEffect(()=>{LS.set('recentFoods',recent);},[recent]);
  useEffect(()=>{LS.set('weights',weights);},[weights]);

  /* ── streak con día de gracia (1 por mes) ── */
  useEffect(()=>{
    if(log.length>0){
      const today=todayKey();
      if(streak.last!==today){
        // Aritmética local: parse YYYY-MM-DD como fecha local, no UTC
        const [yy,mm,dd] = today.split('-').map(Number);
        const prev = new Date(yy, mm-1, dd);
        prev.setDate(prev.getDate()-1);
        const prevKey = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
        // 2 días atrás — para detectar un día perdido
        const twoPrev = new Date(yy, mm-1, dd);
        twoPrev.setDate(twoPrev.getDate()-2);
        const twoPrevKey = `${twoPrev.getFullYear()}-${String(twoPrev.getMonth()+1).padStart(2,'0')}-${String(twoPrev.getDate()).padStart(2,'0')}`;

        const currentMonth = today.slice(0,7); // YYYY-MM
        const graceAvailable = streak.days > 0 &&
          (!streak.graceMonth || streak.graceMonth !== currentMonth);

        let newDays, newGraceMonth;
        if(streak.last===prevKey){
          // Ayer fue el último registro → racha continúa
          newDays = streak.days+1;
          newGraceMonth = streak.graceMonth||'';
        } else if(streak.last===twoPrevKey && graceAvailable){
          // Se saltó ayer pero tiene día de gracia disponible → ¡racha salvada!
          newDays = streak.days+1;
          newGraceMonth = currentMonth;
          setTimeout(()=>setToast('🛡️ Día de gracia usado — ¡racha salvada! (1 por mes)'), 200);
        } else {
          // Racha perdida
          newDays = 1;
          newGraceMonth = streak.graceMonth||'';
        }
        const s={days:newDays, last:today, graceMonth:newGraceMonth};
        setStreak(s); LS.set('streak',s);
      }
    }
  },[log.length]);

  /* ── font + styles ── */
  useEffect(()=>{
    if(!document.querySelector('link[href*="Sora"]')){
      const link=document.createElement('link');
      link.href='https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap';
      link.rel='stylesheet'; document.head.appendChild(link);
    }
    const s=document.createElement('style');
    s.textContent=`
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
      ::-webkit-scrollbar{display:none;}
      body{margin:0;}

      /* ── Core entry animations ── */
      @keyframes ringPulse{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.3)}}
@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
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
        0%{opacity:0;transform:scale(.15) rotate(-12deg)}
        55%{opacity:1;transform:scale(1.1) rotate(3deg)}
        75%{transform:scale(.96) rotate(-1deg)}
        100%{transform:scale(1) rotate(0deg)}
      }
      @keyframes splashTextIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes splashBarFill{from{width:0}to{width:100%}}
      @keyframes splashFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.04)}}
      @keyframes ambientDrift{0%,100%{transform:rotate(0deg) scale(1)}50%{transform:rotate(2deg) scale(1.04)}}
      @keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
      @keyframes leafFloat{0%{transform:translate(0,0) rotate(0);opacity:0}15%{opacity:.6}85%{opacity:.6}100%{transform:translate(25px,-45px) rotate(40deg);opacity:0}}
      @keyframes barFillAnim{0%{width:0}40%{width:45%}70%{width:80%}100%{width:100%}}
      @keyframes tipFadeIn{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes wbModalIn{0%{opacity:0;transform:scale(.8) translateY(30px)}100%{opacity:1;transform:scale(1) translateY(0)}}
      @keyframes wbLogoIn{0%{opacity:0;transform:scale(.3) rotate(-10deg)}50%{transform:scale(1.1) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
      @keyframes msIn{0%{opacity:0;transform:scale(.5) rotate(-5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
      @keyframes msEmoji{0%{opacity:0;transform:scale(0) rotate(-20deg)}55%{transform:scale(1.2) rotate(5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
      @keyframes msShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

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

      /* ── Tab transitions (más fluidas) ── */
      .anim-right{animation:slideInRight .3s cubic-bezier(.34,1.2,.64,1) both}
      .anim-left{animation:slideInLeft .3s cubic-bezier(.34,1.2,.64,1) both}
      .anim{animation:fadeUp .3s cubic-bezier(.34,1.2,.64,1) both}
      .spring-in{animation:springIn .5s cubic-bezier(.25,.46,.45,.94) both}

      /* ── Cards con entrada escalonada ── */
      @keyframes cardIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
      .card-in{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) both}
      .card-in-1{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) .04s both}
      .card-in-2{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) .08s both}
      .card-in-3{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) .12s both}
      .card-in-4{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) .16s both}
      .card-in-5{animation:cardIn .35s cubic-bezier(.34,1.2,.64,1) .20s both}

      /* ── Ring de macros animado ── */
      @keyframes ringFill{from{stroke-dashoffset:var(--ring-start,314)}to{stroke-dashoffset:var(--ring-end,0)}}
      .ring-anim{animation:ringFill .8s cubic-bezier(.25,.46,.45,.94) .2s both}

      /* ── Food item add pop ── */
      @keyframes foodAddPop{0%{transform:scale(1)}30%{transform:scale(1.18) translateY(-3px)}60%{transform:scale(.96)}100%{transform:scale(1)}}
      .food-add{animation:foodAddPop .4s cubic-bezier(.34,1.56,.64,1)}

      /* ── Streak pulse ── */
      @keyframes streakPulse{0%{transform:scale(1)}50%{transform:scale(1.25)}100%{transform:scale(1)}}
      .streak-pulse{animation:streakPulse .5s cubic-bezier(.34,1.56,.64,1)}

      /* ── Modal entrance mejorada ── */
      @keyframes modalIn{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
      @keyframes modalOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(100%)}}
      .modal-in{animation:modalIn .38s cubic-bezier(.34,1.1,.64,1) both}

      /* ── Hero número principal ── */
      @keyframes numberPop{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
      .num-pop{animation:numberPop .5s cubic-bezier(.34,1.56,.64,1) both}

      /* ── Floating button ── */
      @keyframes floatIn{from{opacity:0;transform:scale(0) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
      .float-in{animation:floatIn .4s cubic-bezier(.34,1.56,.64,1) .5s both}

      /* ── Shimmer skeleton ── */
      .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border-radius:8px}

      /* ── Tap feedback ── */
      .tap{transition:transform .12s cubic-bezier(.34,1.56,.64,1),opacity .1s ease;-webkit-user-select:none;user-select:none}
      .tap:active{opacity:.6;transform:scale(.91)}
      .nav-btn{transition:all .22s cubic-bezier(.34,1.56,.64,1)}
      .pop{animation:springPop .35s cubic-bezier(.34,1.56,.64,1)}
      .celebrate{animation:goalCelebrate .5s ease}
    `;
    document.head.appendChild(s);
  },[]);
  /* ── recordatorios inteligentes ── */
  useEffect(()=>{
    if(!notifEnabled) return;
    const check=()=>{
      const now=new Date();
      const h=now.getHours(),m=now.getMinutes();
      const key='notif_'+todayKey();
      const sent=LS.get(key,{});
      const curPct=metas.cal>0?sumLog(log).cal/metas.cal:0;
      const primerNombreN=nombre.split(' ')[0]||'';

      // 08:30 — si no registró desayuno
      if(h===8&&m>=30&&m<55&&!sent.d&&log.filter(r=>r.comida==='Desayuno').length===0){
        setToast(`🌅 Buenos días${primerNombreN?' '+primerNombreN:''}! ¿Qué desayunaste hoy?`);
        LS.set(key,{...sent,d:true});
      }
      // 13:00 — si no registró almuerzo
      if(h===13&&m<30&&!sent.l&&log.filter(r=>r.comida==='Almuerzo').length===0){
        const cal=Math.round(sumLog(log).cal);
        setToast(`☀️ Llevas ${cal} kcal. ¿Registraste el almuerzo?`);
        LS.set(key,{...sent,l:true});
      }
      // 20:00 — si la racha está en riesgo
      if(h===20&&m<30&&!sent.s&&log.length===0&&streak.days>0){
        setToast(`🔥 ¡Tu racha de ${streak.days} días está en riesgo! Registra algo hoy.`);
        LS.set(key,{...sent,s:true});
      }
      // 21:00 — resumen del día si tiene registros
      if(h===21&&m<30&&!sent.n&&log.length>0&&curPct<0.7){
        setToast(`🌙 Llevas ${Math.round(curPct*100)}% de tu meta. ¿Olvidaste registrar algo?`);
        LS.set(key,{...sent,n:true});
      }

      // Recordatorios inteligentes del plan del nutricionista
      const recsPlan = recsToArray(nutriPlan?.recomendaciones);
      if(recsPlan.length>0) {
        const recsKey = 'nutri_recs_'+todayKey();
        const sentRecs = LS.get(recsKey, {});
        const hora = h*60+m;
        recsPlan.forEach((rec, idx) => {
          const recKey = `rec_${idx}`;
          if(sentRecs[recKey]) return;
          const tipo = (rec.tipo||'').toLowerCase();
          let targetMin = 600; // 10:00 default
          // Si el nutricionista prescribió una hora para esa comida, usarla
          if(rec.hora && /^\d{1,2}:\d{2}$/.test(rec.hora)){
            const [hh,mm] = rec.hora.split(':').map(Number);
            targetMin = hh*60+mm;
          } else {
            if(tipo.includes('fruta'))   targetMin = 11*60+30;
            if(tipo.includes('verdura')) targetMin = 13*60+30;
            if(tipo.includes('agua'))    targetMin = 10*60;
            if(tipo.includes('legumbre'))targetMin = 12*60;
          }
          if(hora>=targetMin && hora<targetMin+30) {
            const msgs = rec.hora ? [
              `🕐 ${rec.comida||'Comida'} (${rec.hora}): ${rec.tipo} — ${rec.porcion}`,
              `👩‍⚕️ Es hora de tu ${(rec.comida||'comida').toLowerCase()}: ${rec.tipo} (${rec.porcion})`,
            ] : [
              `🌿 Tu nutricionista recomienda: ${rec.porcion} de ${rec.tipo} hoy`,
              `💡 Recuerda tu meta de ${rec.tipo} — ${rec.porcion}`,
              `👩‍⚕️ ¿Ya cumpliste tu porción de ${rec.tipo}? Meta: ${rec.porcion}`,
            ];
            setToast(msgs[idx % msgs.length]);
            LS.set(recsKey, {...sentRecs, [recKey]:true});
          }
        });
      }

            // LUNES 09:00 — resumen semanal motivacional
      if(now.getDay()===1&&h===9&&m<30&&!sent.lunes){
        const dias=[];
        for(let i=1;i<=7;i++){
          const d=new Date(now);
          d.setDate(d.getDate()-i);
          const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const l=LS.get('log_'+k,[]);
          if(l.length>0) dias.push({fecha:d,cal:sumLog(l).cal});
        }
        const diasBien=dias.filter(d=>d.cal>=metas.cal*0.8&&d.cal<=metas.cal*1.2).length;
        const mejorDia=dias.sort((a,b)=>Math.abs(a.cal-metas.cal)-Math.abs(b.cal-metas.cal))[0];
        const diasSemana=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
        if(dias.length>0){
          const msg=diasBien>=5
            ? `💪 ¡Semana increíble${primerNombreN?' '+primerNombreN:''}! Cumpliste tu meta ${diasBien} de 7 días. ¡Sigue así!`
            : diasBien>=3
            ? `📊 La semana pasada comiste bien ${diasBien} de 7 días${mejorDia?`. Tu mejor día fue el ${diasSemana[mejorDia.fecha.getDay()]} 🏆`:''}.`
            : `🌱 Esta semana es nueva${primerNombreN?' '+primerNombreN:''}. ¡Cada día cuenta, puedes lograrlo!`;
          setToast(msg);
          LS.set(key,{...sent,lunes:true});
          // También enviar push si la app está cerrada
          if('serviceWorker' in navigator&&navigator.serviceWorker.controller){
            navigator.serviceWorker.controller.postMessage({
              type:'SCHEDULE_NOTIFICATIONS',
              notifications:[{
                delay:0,
                title: diasBien>=5?'💪 ¡Semana increíble!':'📊 Resumen semanal',
                body: msg,
                tag:'caloru-lunes',
                icon:'/icon-192.png',
              }],
            });
          }
        }
      }
    };
    const ti=setInterval(check,60000); check();
    return ()=>clearInterval(ti);
  },[notifEnabled,log.length,streak.days,nombre]);

  useEffect(()=>{document.body.style.background=C.bg;},[dark]);

  /* ── auto dark/light by hour ── */
  useEffect(()=>{
    if(!autoTheme) return;
    const check = () => {
      const h = new Date().getHours();
      const shouldBeDark = h >= 20 || h < 7;
      setDark(prev => { if(prev !== shouldBeDark) return shouldBeDark; return prev; });
    };
    const ti = setInterval(check, 60000);
    check();
    return () => clearInterval(ti);
  }, [autoTheme]);

  /* persist exercises + note */
  useEffect(()=>{LS.set('ex_'+todayKey(),exercises);},[exercises]);
  useEffect(()=>{LS.set('note_'+todayKey(),dayNote);},[dayNote]);
  useEffect(()=>{PhotoDB.load('photo_'+todayKey()).then(p=>{if(p)setDayPhoto(p);});},[]);
  useEffect(()=>{if(dayPhoto)PhotoDB.save('photo_'+todayKey(),dayPhoto);},[dayPhoto]);
  useEffect(()=>{LS.set('autoTheme',autoTheme);},[autoTheme]);
  useEffect(()=>{LS.set('customMetas',customMetas);},[customMetas]);
  useEffect(()=>{LS.set('allergens',userAllergens);},[userAllergens]);
  useEffect(()=>{LS.set('veganMode',veganMode);},[veganMode]);
  useEffect(()=>{LS.set('sinCalorias',sinCalorias);},[sinCalorias]);
  useEffect(()=>{LS.set('accountType',accountType);},[accountType]);
  useEffect(()=>{LS.set('proMode',proMode);},[proMode]);
  useEffect(()=>{LS.set('photoUrl',photoUrl);},[photoUrl]);
  useEffect(()=>{LS.set('logrosVis',logrosVis);},[logrosVis]);
  // Banner rotativo
  useEffect(()=>{
    const t = setInterval(()=>setBannerIdx(i=>(i+1)%3),5000);
    return ()=>clearInterval(t);
  },[]);
  useEffect(()=>{LS.set('nutriPlan',nutriPlan);},[nutriPlan]);
  useEffect(()=>{LS.set('weightHistory',weightHistory);},[weightHistory]);

  /* ── Sync bidireccional al hacer login ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    let watchdog = null;
    (async()=>{
      // Solo bloqueamos la UI si NO sabemos aún si el usuario tiene cuenta
      // (primera vez en este dispositivo). Si ya está onboarded localmente,
      // la app es 100% usable desde localStorage → renderizamos al tiro y
      // sincronizamos en segundo plano.
      const localOnboarded = LS.get('onboarded', false);
      const blockUI = !localOnboarded;
      if(blockUI){
        setRestoringData(true);
        // Red de seguridad: nunca dejar la app congelada en la pantalla de
        // carga. Si la red está lenta o falla, igual entramos a los 6s.
        watchdog = setTimeout(()=>setRestoringData(false), 6000);
      }
      setSyncStatus('syncing');
      try {
        // 1. Leer qué hay en Supabase (descarga)
        const remote = await restoreFromSupabase(supabaseUser.id);

        // 2. Leer qué hay localmente
        const localNombre    = LS.get('nombre','');
        const localPerfil    = LS.get('perfil', null);
        const localObj       = LS.get('obj','mantener');
        const localWeight    = LS.get('weightHistory',[]);

        // 3. Si Supabase tiene datos → restaurar en este dispositivo
        if(remote.profile?.nombre){
          const p = remote.profile;
          setNombre(p.nombre);           LS.set('nombre', p.nombre);
          if(p.perfil){ setPerfil(p.perfil); LS.set('perfil', p.perfil); }
          if(p.obj){    setObj(p.obj);       LS.set('obj', p.obj); }
          LS.set('onboarded', true);     setOnboarded(true);
        }
        if(remote.settings){
          const s = remote.settings;
          if(s.allergens?.length)  { setUserAllergens(s.allergens); LS.set('allergens', s.allergens); }
          if(s.vegan_mode != null) { setVeganMode(s.vegan_mode);    LS.set('veganMode', s.vegan_mode); }
          if(s.dark_mode  != null) { setDark(s.dark_mode);          LS.set('darkMode', s.dark_mode); }
        }
        if(remote.logs?.length){
          remote.logs.forEach(row=>{
            if(row.log?.length)       LS.set('log_'+row.date, row.log);
            if(row.agua > 0)          LS.set('agua_'+row.date, row.agua);
            if(row.exercises?.length) LS.set('ex_'+row.date, row.exercises);
          });
          const todayRow = remote.logs.find(r=>r.date===todayKey());
          if(todayRow){
            if(todayRow.log?.length)       setLog(todayRow.log);
            if(todayRow.agua > 0)          setAgua(todayRow.agua);
            if(todayRow.exercises?.length) setExercises(todayRow.exercises);
          }
        }
        if(remote.weights?.length){
          const wh = remote.weights.map(r=>({
            date:r.date, label:r.date.slice(5), w:parseFloat(r.weight)
          }));
          setWeightHistory(wh); LS.set('weightHistory', wh);
        }

        // ★ Desbloquear la UI AHORA: ya tenemos el estado de la cuenta.
        // La subida (push) de abajo es solo upload y no afecta lo que ve
        // el usuario, así que va en segundo plano.
        if(watchdog){ clearTimeout(watchdog); watchdog=null; }
        setRestoringData(false);

        // 4. Si este dispositivo tiene datos que Supabase NO tiene → subir
        //    (en paralelo y sin bloquear el render)
        const needsPush = !remote.profile?.nombre && localOnboarded && localNombre.length > 0;
        if(needsPush){
          const tasks = [
            syncProfile(supabaseUser.id, { nombre:localNombre, perfil:localPerfil, obj:localObj }),
            syncSettings(supabaseUser.id, {
              allergens:userAllergens, veganMode, darkMode:dark,
              notifEnabled, streak:LS.get('streak',{}), challenge21:LS.get('challenge21',null),
            }),
          ];
          for(let i=0;i<30;i++){
            const d=new Date(); d.setDate(d.getDate()-i);
            const key=dateToKey(d);
            const dl=LS.get('log_'+key,[]);
            const da=LS.get('agua_'+key,0);
            const de=LS.get('ex_'+key,[]);
            if(dl.length||da||de.length) tasks.push(syncDay(supabaseUser.id, key, dl, da, de));
          }
          if(localWeight.length) tasks.push(syncWeight(supabaseUser.id, localWeight));
          await Promise.all(tasks);
        }

        setSyncStatus('done');
        setTimeout(()=>setSyncStatus('idle'),2000);
      } catch(e){
        console.error('Sync error:',e);
        setSyncStatus('error');
      } finally {
        if(watchdog){ clearTimeout(watchdog); watchdog=null; }
        setRestoringData(false);
      }
    })();
    return ()=>{ if(watchdog) clearTimeout(watchdog); };
  },[supabaseUser?.id]);


  /* ── Sync automático: log del día ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    let cancelled = false;
    if(syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(()=>{
      setSyncStatus('syncing');
      syncDay(supabaseUser.id, todayKey(), log, agua, exercises)
        .then(()=>{
          if(!cancelled){ setSyncStatus('done'); setTimeout(()=>setSyncStatus('idle'),1500); }
          // Si el paciente está vinculado a un nutricionista, registrar su actividad
          // para que el panel profesional muestre el estado real (no fantasma).
          if(nutriPlan && log.length>0){
            supabase.from('nutrition_plans')
              .update({ultima_actividad:new Date().toISOString()})
              .eq('paciente_id', supabaseUser.id)
              .then(()=>{}, ()=>{});
          }
        })
        .catch(()=>{ if(!cancelled) setSyncStatus('error'); });
    }, 2000); // debounce 2s
    return ()=>{ cancelled = true; };
  },[log.length, agua, exercises.length, supabaseUser?.id]);

  /* ── Sync automático: peso ── */
  useEffect(()=>{
    if(!supabaseUser || !weightHistory.length) return;
    syncWeight(supabaseUser.id, weightHistory);
  },[weightHistory.length, supabaseUser?.id]);

  /* ── Sync automático: perfil ── */
  useEffect(()=>{
    if(!supabaseUser || !nombre) return;
    syncProfile(supabaseUser.id, { nombre, perfil, obj });
  },[nombre, JSON.stringify(perfil), obj, supabaseUser?.id]);

  /* ── Sync automático: settings ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    syncSettings(supabaseUser.id, {
      allergens: userAllergens, veganMode, darkMode: dark,
      notifEnabled: notifEnabled,
      streak: LS.get('streak',{}),
      challenge21: LS.get('challenge21',null),
    });
  },[userAllergens, veganMode, dark, notifEnabled, supabaseUser?.id]);

  /* ── Re-schedule notificaciones: al abrir app y al volver al foco ── */
  useEffect(()=>{
    const reschedule = () => {
      if(!('Notification' in window) || Notification.permission !== 'granted') return;
      const reminders = LS.get('reminders', []);
      if(!reminders.some(r=>r.activo)) return;
      // Esperar a que el SW esté listo
      if(navigator.serviceWorker?.controller){
        sendScheduleToSW(reminders);
      } else if(navigator.serviceWorker){
        navigator.serviceWorker.ready.then(()=>{ if(navigator.serviceWorker.controller) sendScheduleToSW(reminders); });
      }
    };
    reschedule();
    const onVisible = () => { if(document.visibilityState==='visible') reschedule(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  },[]);

  /* ── Detección de milestones de racha para compartir ── */
  useEffect(()=>{
    const MILESTONE_DAYS = [3,7,14,21,30,50,100];
    if(!MILESTONE_DAYS.includes(streak.days)) return;
    const key = `streak_${streak.days}`;
    const shown = LS.get('achievements_shown',[]);
    if(shown.includes(key)) return; // ya celebrado
    // Esperar 800ms para no interrumpir el flujo del usuario
    const t = setTimeout(()=>{
      setPendingAchievement({ key, nombre: nombre||'', valor:`${streak.days} días consecutivos 🔥` });
      LS.set('achievements_shown',[...shown, key]);
    }, 800);
    return ()=>clearTimeout(t);
  },[streak.days]);

  /* ── daily AI insight (se genera una vez por día) ── */
  useEffect(()=>{
    const insightKey='insight_'+todayKey();
    if(LS.get(insightKey,'')) return; // ya generado hoy
    if(!nombre||log.length===0) return; // esperar datos reales
    const generate=async()=>{
      setInsightLoading(true);
      try{
        const prevDay=new Date(); prevDay.setDate(prevDay.getDate()-1);
        const prevKey=dateToKey(prevDay);
        const prevLog=LS.get('log_'+prevKey,[]);
        const prevProt=Math.round(sumLog(prevLog).prot);
        const insightUserMsg=`Datos de hoy de ${nombre}: ${Math.round(tot.cal)} kcal de ${metas.cal} kcal meta (${metas.cal>0?Math.round(tot.cal/metas.cal*100):0}%), ${Math.round(tot.prot)}g proteína de ${metas.prot}g meta, racha de ${streak.days} días consecutivos.${prevProt>0?` Ayer consumió ${prevProt}g de proteína.`:''} Objetivo: ${obj==='bajar'?'bajar de peso':obj==='subir'?'ganar músculo':obj==='recomp'?'recomposición corporal':'mantener peso'}. Genera UN SOLO insight motivacional personalizado en máximo 2 oraciones. Usa EXACTAMENTE estos números, no inventes otros. Solo el insight, sin saludos ni explicaciones.`;
        const data = await callEdgeFn({ mode: 'chat', system: 'Eres un nutricionista chileno amigable y motivador. Generas insights breves y personalizados basándote en los datos reales del usuario. Solo devuelves el insight sin saludos, sin "Hola", sin explicaciones adicionales.', messages:[{role:'user',content:insightUserMsg}] });
        const text=data.text||'';
        if(text){ setDailyInsight(text); LS.set(insightKey,text); LS.set(insightKey+'_cal', tot.cal); }
      }catch(e){}
      setInsightLoading(false);
    };
    generate();
  },[log.length,nombre,streak.days]);
  useEffect(()=>{LS.set('xpTotal',xpTotal);},[xpTotal]);
  useEffect(()=>{LS.set('customFoods',customFoods);},[customFoods]);
  useEffect(()=>{LS.set('favorites',favorites);},[favorites]);
  useEffect(()=>{LS.set('fastStart',fastStart);},[fastStart]);
  useEffect(()=>{LS.set('fastGoal',fastGoal);},[fastGoal]);
  useEffect(()=>{LS.set('notif',notifEnabled);},[notifEnabled]);
  useEffect(()=>{LS.set('avatar',avatar);},[avatar]);

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
      const key=dateToKey(d);
      const dayLog=LS.get('log_'+key,[]);
      const cal=Math.round(sumLog(dayLog).cal);
      days.push({date:key,cal,label:d.toLocaleDateString('es-CL',{weekday:'short'})});
    }
    setWeekData(days);
  },[tab]);

  /* ── day change: reset counters at midnight (hora local) ── */
  useEffect(()=>{

    const doReset = (today) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate()-1);
      const yKey = dateToKey(yesterday);

      /* 1. Save summary of yesterday before overwriting */
      const yLog = LS.get('log_'+yKey, []);
      if(yLog.length > 0){
        const s = sumLog(yLog);
        LS.set('summary_'+yKey, {
          cal:   Math.round(s.cal),
          prot:  Math.round(s.prot),
          carbs: Math.round(s.carbs),
          grasas:Math.round(s.grasas),
          items: yLog.length,
          date:  yKey,
        });
      }

      /* 2. Update streak properly */
      const prevStreak = LS.get('streak', {days:0, last:''});
      const yHadLog    = yLog.length > 0;
      let newStreak;
      if(yHadLog){
        // Yesterday was logged → continue or start streak
        const lastDate = prevStreak.last;
        const [_y,_m,_d] = today.split('-').map(Number);
        const dayBefore = new Date(_y, _m-1, _d);
        dayBefore.setDate(dayBefore.getDate()-1);
        const dayBeforeKey = dateToKey(dayBefore);
        if(lastDate === dayBeforeKey){
          newStreak = {days: prevStreak.days+1, last: today};
        } else {
          newStreak = {days: 1, last: today};
        }
      } else {
        // Yesterday had nothing → reset streak
        newStreak = {days: 0, last: prevStreak.last};
      }
      LS.set('streak', newStreak);
      setStreak(newStreak);

      /* 3. Load today's data (may already exist if app was used) */
      setCurrentDay(today);
      setLog(        LS.get('log_'  +today, []));
      setAgua(       LS.get('agua_' +today, 0));
      setExercises(  LS.get('ex_'   +today, []));
      setDayNote(    LS.get('note_' +today, ''));
      setFastStart(null); LS.set('fastStart', null);

      /* 4. Show transition toast */
      const msgs = [
        '🌅 ¡Buenos días! Nuevo día, nueva oportunidad',
        '✨ Medianoche pasó. ¡Empezamos de cero!',
        '🌙 ¡Nuevo día! Los contadores se reiniciaron',
      ];
      const streakAfter2=LS.get('streak',{days:0,last:''});
      if([3,7,14,21,30,60,100].includes(streakAfter2.days)){
        setToast(streakAfter2.days+' dias seguidos! Eres imparable. ');
      } else {
        setToast(msgs[Math.floor(Math.random()*msgs.length)]);
      }
    };

    const checkDay = () => {
      const today = todayKey();
      if(today !== currentDay) doReset(today);
    };

    /* Check every 20 seconds */
    const ti = setInterval(checkDay, 20000);

    /* Also check immediately when user returns to the app */
    const onVisible = () => { if(!document.hidden) checkDay(); };
    const onFocus   = () => checkDay();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(ti);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentDay]);

  /* ── Welcome back detection ── */
  useEffect(()=>{
    const lastVisit = LS.get('lastVisit','');
    const today = todayKey();
    if(lastVisit && lastVisit !== today){
      const last = new Date(lastVisit.replace(/-/g,'/'));
      const now = new Date(today.replace(/-/g,'/'));
      const diff = Math.round((now-last)/(1000*60*60*24));
      if(diff >= 2){
        setDaysAway(diff);
        setShowWelcomeBack(true);
      }
    }
    LS.set('lastVisit', today);
  },[]);

  /* ── Milestone detection ── */
  useEffect(()=>{
    const shown = LS.get('milestones_shown',{});
    const check = (key) => {
      if(!shown[key]){
        setShowMilestone(key);
        LS.set('milestones_shown',{...shown,[key]:true});
        return true;
      }
      return false;
    };
    if(streak.days>=60) check('streak60');
    else if(streak.days>=30) check('streak30');
    else if(streak.days>=14) check('streak14');
    else if(streak.days>=7)  check('streak7');
    // Total food logs across all days
    const totalLogs = log.length;
    if(totalLogs>=200) check('foods_200');
    else if(totalLogs>=50) check('foods_50');
  },[streak.days, log.length]);

  /* ── toast auto-dismiss ── */
  useEffect(()=>{
    if(toast){const t=setTimeout(()=>setToast(''),3200);return ()=>clearTimeout(t);}
  },[toast]);

  /* ── Detección de meseta ── */
  const detectarMeseta = useMemo(()=>{
    if(obj!=='bajar'&&obj!=='subir') return null;
    if(weightHistory.length < 4) return null;
    const ultimos = weightHistory.slice(-14);
    if(ultimos.length < 4) return null;
    const pesoInicio = ultimos[0].w;
    const pesoFinal = ultimos[ultimos.length-1].w;
    const cambio = Math.abs(pesoFinal - pesoInicio);
    const diasTranscurridos = ultimos.length;
    // Meseta: menos de 0.3kg de cambio en 2+ semanas
    if(diasTranscurridos >= 10 && cambio < 0.3) {
      return {
        tipo: obj==='bajar' ? 'bajada' : 'subida',
        diasEstancado: diasTranscurridos,
        pesoActual: pesoFinal,
        cambio: cambio.toFixed(1),
      };
    }
    return null;
  },[weightHistory, obj]);

  /* ── XP diario ── */
  useEffect(()=>{
    if(!log.length) return;
    const xpKey = 'xpHoy_'+todayKey();
    const xpAnterior = LS.get(xpKey,0);
    const xpNuevo = calcXPDia(tot, metas, agua, waterGoal, exercises, streak);
    if(xpNuevo > xpAnterior){
      const diff = xpNuevo - xpAnterior;
      setXpTotal(prev=>prev+diff);
      LS.set(xpKey, xpNuevo);
      setXpHoy(xpNuevo);
    }
  },[log.length, agua, exercises.length, streak.days]);

  /* ── computed ── */
  const tdee   = calcTDEE(perfil);
  const esFinde = [0,6].includes(new Date().getDay()); // 0=domingo, 6=sábado
  const ritmoEfectivo = (modoFinde && isPro && esFinde) ? 'tranquilo' : ritmo;
  const autoMetas = calcMetas(tdee, obj, parseFloat(perfil.peso)||70, ritmoEfectivo);
  const metas     = customMetas || autoMetas;
  const tot    = useMemo(()=>sumLog(log),[log]);
  const pct    = metas.cal>0?tot.cal/metas.cal:0;
  const tips   = getTips(tot, metas, obj, agua, pct, exercises, streak, waterGoal);
  const saludScore = calcSaludScore(tot, metas, agua, exercises, streak);

  const MACRO_DEFS = [
    {key:'cal',    label:'Calorías',      icon:'🔥', color:'#D42020',  meta:metas.cal,   unit:'kcal'},
    {key:'prot',   label:'Proteínas',     icon:'🥩', color:C.red,      meta:metas.prot,  unit:'g'},
    {key:'carbs',  label:'Carbohidratos', icon:'🍞', color:C.amber,    meta:metas.carbs, unit:'g'},
    {key:'grasas', label:'Grasas',        icon:'🥑', color:C.purple,   meta:metas.grasas,unit:'g'},
    {key:'fibra',  label:'Fibra',         icon:'🥦', color:C.green,    meta:25,          unit:'g'},
    {key:'azucar', label:'Azúcar',        icon:'🍬', color:'#FF6B6B',  meta:25,          unit:'g'},
    {key:'sodio',  label:'Sodio',         icon:'🧂', color:'#8E8E93',  meta:2300,        unit:'mg'},
  ];
  const reste  = Math.max(0,metas.cal-Math.round(tot.cal));
  const sobre  = Math.round(tot.cal)-metas.cal;
  const ringR=50, ringC=2*Math.PI*ringR, ringPct=Math.min(pct,1);

  /* ── Goal celebration + NutriBot feliz ── */
  useEffect(()=>{
    if(pct>=1 && lastPct<1 && tot.cal>0){
      setConfetti(true);
      haptic('goal');
      setTimeout(()=>setConfetti(false), 3000);
      // NutriBot baila por 4 segundos
      setNutribotHappy(true);
      setTimeout(()=>setNutribotHappy(false), 4000);
      // Toast motivador chileno
      const msgs = [
        '🎉 ¡Meta del día cumplida! ¡Bacán po!',
        '🎯 ¡Lo lograste! Meta calórica completada 💪',
        '🏆 ¡Excelente día! Tu racha sigue viva 🔥',
        '✅ ¡Meta cumplida! Eso se celebra, campeón 🇨🇱',
      ];
      setToast(msgs[Math.floor(Math.random()*msgs.length)]);
    }
    setLastPct(pct);
  },[pct]);

  /* ── Achievement checker (runs after pct is defined) ── */
  useEffect(()=>{
    const prev = LS.get('achievements',{});
    const checks = {
      first_log:   {done: log.length>0,          label:'¡Primer registro! 🌱'},
      water_goal:  {done: agua>=waterGoal,        label:'¡Hidratación perfecta! 💧'},
      streak_3:    {done: streak.days>=3,         label:'3 días seguidos 🔥'},
      streak_7:    {done: streak.days>=7,         label:'¡Una semana entera! 🏆'},
      all_meals:   {done: MEALS.every(m=>log.some(r=>r.comida===m)), label:'¡Día completo! ✅'},
      first_ex:    {done: exercises.length>0,     label:'¡Primer ejercicio! 💪'},
      cal_goal:    {done: pct>=0.9&&pct<=1.1,     label:'¡Meta calórica cumplida! 🎯'},
      first_fav:   {done: favorites.length>0,     label:'Primer favorito guardado ⭐'},
      streak_14:   {done: streak.days>=14,        label:'¡14 días de racha! 🔥🏆'},
    };
    let newlyUnlocked = null;
    Object.entries(checks).forEach(([k,{done,label}])=>{
      if(done && !prev[k]){
        LS.set('achievements',{...LS.get('achievements',{}),[k]:true});
        newlyUnlocked = label; // show last unlocked
      }
    });
    if(newlyUnlocked){
      setNewAchiev(newlyUnlocked);
      haptic('goal');
      setTimeout(()=>setNewAchiev(null), 3500);
    }
  },[log.length, agua, streak.days, pct, exercises.length, favorites.length]);
  const totalBurned = exercises.reduce((s,e)=>s+e.burn,0);
  const netCals = Math.round(tot.cal) - totalBurned;

  const exportCSV = () => {
    const rows = [['Fecha','Calorías','Proteínas(g)','Carbos(g)','Grasas(g)','Azúcar(g)','Fibra(g)','Sodio(mg)','Agua(vasos)','Ejercicio(kcal)']];
    for(let i=0;i<30;i++){
      const d=new Date(); d.setDate(d.getDate()-i);
      const key=dateToKey(d);
      const dayLog=LS.get('log_'+key,[]);
      if(!dayLog.length) continue;
      const s=sumLog(dayLog);
      const agua2=LS.get('agua_'+key,0);
      const exs2=LS.get('ex_'+key,[]);
      const burned2=exs2.reduce((t,e)=>t+e.burn,0);
      rows.push([key,Math.round(s.cal),Math.round(s.prot),Math.round(s.carbs),Math.round(s.grasas),Math.round(s.azucar||0),Math.round(s.fibra),Math.round(s.sodio||0),agua2,burned2]);
    }
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url;
    a.download='caloru-datos-'+todayKey()+'.csv'; a.click();
    URL.revokeObjectURL(url);
    haptic('success'); setToast('📊 Datos exportados como CSV');
  };

  const allFoods = [...DB,...customFoods];
  // Condiciones de salud normalizadas a array (soporta selección múltiple, con retrocompat)
  const condiciones = Array.isArray(perfil.condiciones)
    ? perfil.condiciones
    : (perfil.condicion&&perfil.condicion!=='ninguna' ? [perfil.condicion] : []);
  const fastElapsed = fastStart ? Math.floor((fastNow-fastStart)/3600000) : 0;
  const fastPct = fastGoal>0 ? Math.min(fastElapsed/fastGoal,1) : 0;
  const fastDone = fastElapsed >= fastGoal;

  const foods  = useMemo(()=>{
    const s=q.toLowerCase();
    const filtered = allFoods.filter(a=>{
      const matchText=(a.nombre.toLowerCase().includes(s)||a.marca.toLowerCase().includes(s));
      const matchCat=(cat==='Todas'||a.cat===cat);
      const matchVegan=!veganMode||isVegan(a);
      const matchAllergens=userAllergens.length===0||
        !getFoodAllergens(a).some(al=>userAllergens.includes(al));
      const matchMaxCal=searchMaxCal===0||a.cal<=searchMaxCal;
      return matchText&&matchCat&&matchVegan&&matchAllergens&&matchMaxCal;
    });
    /* Ordenamiento — solo si el usuario eligió algo distinto a "default" */
    if(searchSort==='cal_asc')   filtered.sort((a,b)=>a.cal-b.cal);
    else if(searchSort==='cal_desc')  filtered.sort((a,b)=>b.cal-a.cal);
    else if(searchSort==='prot_desc') filtered.sort((a,b)=>b.prot-a.prot);
    else if(searchSort==='name')      filtered.sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
    return filtered;
  },[q,cat,veganMode,userAllergens,searchSort,searchMaxCal,customFoods.length]);

  /* ── actions ── */
  const toggleFav = (food) => {
    const isFav=favorites.some(f=>f.id===food.id);
    if(isFav) setFavorites(favorites.filter(f=>f.id!==food.id));
    else setFavorites([...favorites,food].slice(0,20));
  };

  const [addFlash, setAddFlash] = useState(false);
  const addFood = useCallback((a)=>{
    /* Normalizar gramos: null ó undefined ó la porción base = "porción estándar" → null.
       Esto evita duplicados como "1 hallulla (null)" + "1 hallulla (70g)" que son lo mismo. */
    const targetGrams = (a.grams && a.grams !== a.porcion) ? a.grams : null;
    /* Usar setter funcional para que múltiples llamadas seguidas (ej: escáner IA con varios
       ingredientes) trabajen sobre el estado más reciente y no sobre el closure stale. */
    setLog(prev => {
      const ex = prev.find(r =>
        r.id === a.id &&
        r.comida === meal &&
        ((r.grams || null) === targetGrams)
      );
      if(ex) return prev.map(r=>r.uid===ex.uid?{...r,qty:r.qty+1}:r);
      return [...prev,{...a,comida:meal,qty:1,uid:Date.now()+Math.random(),grams:targetGrams}];
    });
    setRecent(prev=>{const f=prev.filter(x=>x.id!==a.id);return [a,...f].slice(0,8);});
    /* Auto-save scanned/manual products to "Agregados por ti" */
    if((a.cat==='Escaneado'||a.barcode||a.marca==='Manual'||a.marca==='Estimado')){
      setCustomFoods(prev=>{
        if(prev.find(f=>f.id===a.id||(a.barcode&&f.barcode===a.barcode))) return prev;
        const saved={...a,savedAt:Date.now(),origen:'escaneado'};
        return [...prev, saved];
      });
    }
    setDetail(null);
    haptic('add');
    setToast(`✓ ${a.nombre.split(' ').slice(0,3).join(' ')} agregado`);
    setAddFlash(true); setTimeout(()=>setAddFlash(false),600);
  },[meal]);

  const adj=(uid,d)=>setLog(log.map(r=>r.uid===uid?{...r,qty:r.qty+d}:r).filter(r=>r.qty>0));
  const setItemGrams=(uid,g)=>setLog(log.map(r=>r.uid===uid?{...r,grams:Math.max(1,g)}:r));
  const setItemQty=(uid,q)=>{if(q<1){setLog(log.filter(r=>r.uid!==uid));}else{setLog(log.map(r=>r.uid===uid?{...r,qty:q}:r));}}
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
      <button onClick={onInc} style={{width:30,height:30,borderRadius:9,border:'none',background:'#D42020',color:'white',fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
    </div>
  );

  /* ════════════ RENDER ════════════ */
  if(!isOnline) return (
    <div style={{
      position:'fixed',inset:0,
      background:dark?'#000':'#F2F2F7',
      display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',
      gap:20,padding:32,
      fontFamily:F,
    }}>
      <Logo size={80}/>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:22,fontWeight:800,color:dark?'#FFF':'#1C1C1E',marginBottom:8}}>Sin conexión</div>
        <div style={{fontSize:14,color:dark?'rgba(255,255,255,0.5)':'#6D6D72',lineHeight:1.6,maxWidth:260}}>
          Calorú funciona offline, pero necesitas internet para sincronizar tu progreso.
        </div>
      </div>
      <div style={{background:dark?'rgba(255,255,255,0.06)':'white',borderRadius:18,padding:'14px 20px',border:`1px solid ${dark?'rgba(255,255,255,0.1)':'#E5E5EA'}`,maxWidth:280,width:'100%'}}>
        {[
          {icon:'📋',text:'Puedes ver tus registros de hoy'},
          {icon:'➕',text:'Puedes agregar comidas'},
          {icon:'🔄',text:'Se sincronizará al volver la conexión'},
        ].map(({icon,text})=>(
          <div key={text} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',fontSize:13,color:dark?'rgba(255,255,255,0.7)':'#3C3C43'}}>
            <span style={{fontSize:16}}>{icon}</span>{text}
          </div>
        ))}
      </div>
      <button onClick={()=>setIsOnline(navigator.onLine)} style={{
        padding:'12px 28px',borderRadius:16,border:'none',
        background:'#D42020',color:'white',
        fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F,
      }}>Reintentar</button>
    </div>
  );

  if(splash) return <Splash onDone={()=>setSplash(false)}/>;

  // Mientras restauramos datos de Supabase, mostrar pantalla de carga
  // para no mostrar el onboarding a usuarios que ya tienen cuenta
  if(restoringData) return (
    <div style={{
      position:'fixed',inset:0,
      background:'linear-gradient(160deg,#1A0A0A 0%,#0D0505 55%,#0A0205 100%)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      gap:24,
    }}>
      <Logo size={80}/>
      <div style={{textAlign:'center'}}>
        <div style={{color:'white',fontSize:22,fontWeight:800,fontFamily:F,letterSpacing:'-1px'}}>
          Calor<span style={{color:'#D22B2B'}}>ú</span>
        </div>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:13,fontFamily:F,marginTop:6}}>
          Recuperando tu progreso...
        </div>
      </div>
      <div style={{width:160,height:3,background:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden'}}>
        <div style={{
          height:'100%',width:'60%',borderRadius:3,
          background:'linear-gradient(90deg,#D42020,#F5C21A)',
          animation:'splashBarFill 1.5s ease infinite alternate',
        }}/>
      </div>
    </div>
  );

  if(!onboarded) return <Onboarding onDone={({nombre:n,perfil:p,obj:o,accountType:at,comuna:cm})=>{
    setNombre(n); setPerfil(p); setObj(o);
    setAccountType(at||'personal');
    if(cm){setComuna(cm);LS.set('comuna',cm);}
    setOnboarded(true); LS.set('onboarded',true);
    LS.set('nombre',n); LS.set('perfil',p); LS.set('obj',o);
    LS.set('accountType',at||'personal');
    // Save to Supabase if logged in
    if(supabaseUser) {
      supabase.from('profiles').upsert({id:supabaseUser.id, account_type:at||'personal'},{onConflict:'id'}).then(()=>{});
    }
  }}/>;

  // Si es profesional y está en modo profesional → verificar suscripción y mostrar panel
  if(accountType==='professional' && proMode==='professional') {
    // Esperar a que cargue la suscripción antes de renderizar (evita bypass vía localStorage)
    if(supabaseUser && !subscriptionStatus) {
      return (
        <div style={{minHeight:'100vh',background:dark?'#0D0D0D':'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12,animation:'spin 1s linear infinite'}}>🔐</div>
            <div style={{fontSize:14,color:dark?'rgba(255,255,255,0.5)':'#8E8E93'}}>Verificando suscripción...</div>
          </div>
        </div>
      );
    }
    // Bloquear si está logueado y la suscripción cargó pero no es 'nutricionista'
    const notSubscribed = supabaseUser && subscriptionStatus !== 'nutricionista';
    if(notSubscribed) {
      return (
        <div style={{minHeight:'100vh',background:dark?'#0D0D0D':'#F2F2F7',fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}>
          <div style={{fontSize:56,marginBottom:16}}>👩‍⚕️</div>
          <div style={{fontSize:22,fontWeight:800,color:dark?'white':'#1C1C1E',marginBottom:8}}>Panel Nutricionista</div>
          <div style={{fontSize:13,color:dark?'rgba(255,255,255,0.5)':'#8E8E93',lineHeight:1.6,marginBottom:24,maxWidth:280}}>Necesitas el Plan Profesional para acceder al panel de gestión de pacientes.</div>
          <div style={{background:'linear-gradient(135deg,#1D3557,#2E6DA4)',borderRadius:20,padding:'24px 20px',width:'100%',maxWidth:320,marginBottom:16}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontWeight:700,letterSpacing:1.2,textTransform:'uppercase',marginBottom:8}}>Plan Profesional</div>
            <div style={{fontSize:34,fontWeight:800,color:'white',marginBottom:4}}>$9.990<span style={{fontSize:14,fontWeight:400,color:'rgba(255,255,255,0.7)'}}>/mes</span></div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginBottom:20,lineHeight:1.6}}>Panel de pacientes · Planes nutricionales · Código de vinculación · Pro para tus pacientes</div>
            <button onClick={async()=>{
              if(!supabaseUser){setToast('Inicia sesión para suscribirte.');return;}
              try{
                const session=await supabase.auth.getSession();
                const token=session.data.session?.access_token;
                const res=await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/create-subscription',{
                  method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                  body:JSON.stringify({plan:'nutricionista',back_url:'https://caloru.cl'}),
                });
                const data=await res.json();
                if(data.init_point) window.location.href=data.init_point;
                else setToast('Error al crear la suscripción. Intenta de nuevo.');
              }catch{setToast('Error de conexión. Intenta de nuevo.');}
            }} style={{width:'100%',padding:'13px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontFamily:F,cursor:'pointer',fontSize:14,fontWeight:800}}>
              Suscribirse — $9.990/mes →
            </button>
          </div>
          <button onClick={()=>setProMode('personal')} style={{background:'none',border:'none',color:dark?'rgba(255,255,255,0.4)':'#8E8E93',fontFamily:F,cursor:'pointer',fontSize:13,padding:'8px'}}>
            Volver a modo personal
          </button>
        </div>
      );
    }
    return <PanelProfesional C={C} F={F} dark={dark} nombre={nombre} supabaseUser={supabaseUser} onSwitchPersonal={()=>setProMode('personal')}/>;
  }

  return (
    <div style={{fontFamily:F,minHeight:'100vh',background:C.bg,paddingBottom:'calc(88px + env(safe-area-inset-bottom, 34px))',transition:'background .3s'}}>

      {/* ══ FOOD DETAIL MODAL ══ */}
      {detailFood&&(
        <ModalDetalle food={detailFood} meal={meal} C={C} F={F}
          onClose={()=>setDetail(null)} onAdd={addFood}
          onFav={()=>toggleFav(detailFood)}
          isFav={favorites.some(f=>f.id===detailFood?.id)}/>
      )}

      {/* ══ CONFETTI ══ */}
      {/* ══ WEEKLY SUMMARY ══ */}
      {showWeekly&&<WeeklySummary C={C} F={F} metas={metas} streak={streak} xpTotal={xpTotal} onClose={()=>setShowWeekly(false)}/>}

      {/* ══ SHARE CARD ══ */}
      {showShare&&<ShareCard C={C} F={F} nombre={nombre} tot={tot} metas={metas} obj={obj} streak={streak} exercises={exercises} xpTotal={xpTotal} nivel={getNivel(xpTotal)} onClose={()=>setShowShare(false)}/>}

      {/* ══ ACHIEVEMENT SHARE ══ */}
      {pendingAchievement&&<ShareAchievementModal C={C} F={F} achievement={pendingAchievement} onClose={()=>setPendingAchievement(null)}/>}

      {/* ══ HISTORY MODAL ══ */}
      {showHistory&&(
        <div style={{position:'fixed',inset:0,background:C.bg,zIndex:80,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
          <div style={modalHeaderStyle(C)}>
            <button onClick={()=>setShowHistory(false)} style={backBtnStyle(C)}>‹ Volver</button>
            <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📅 Historial {isPro?<span style={{fontSize:10,background:'#FFD700',color:'#000',padding:'2px 6px',borderRadius:6,marginLeft:4,fontWeight:800}}>90 días ⭐</span>:<span style={{fontSize:10,color:C.textSec,fontWeight:500}}>14 días</span>}</div>
            <div style={{minWidth:80}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
            {Array.from({length:isPro?90:14},(_,i)=>{
              const d=new Date(); d.setDate(d.getDate()-1-i);
              const key=dateToKey(d);
              const dayLog=LS.get('log_'+key,[]);
              const cal=Math.round(sumLog(dayLog).cal);
              const note=LS.get('note_'+key,'');
              const exs=LS.get('ex_'+key,[]);
              const isSel=historyDay===key;
              return(
                <div key={key} style={{marginBottom:8}}>
                  <div onClick={()=>setHistoryDay(isSel?null:key)} style={{
                    background:C.surface,borderRadius:18,padding:'14px 16px',
                    border:`1px solid ${isSel?'#D42020':C.border}`,cursor:'pointer',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:13,background:cal>0?'#D4202018':'#F2F2F7',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:800,color:cal>0?'#D42020':C.textMuted}}>{d.getDate()}</div>
                        <div style={{fontSize:8,color:cal>0?'#D42020':C.textMuted,fontWeight:600,textTransform:'uppercase'}}>{d.toLocaleDateString('es-CL',{month:'short'})}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,textTransform:'capitalize'}}>{d.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}</div>
                        <div style={{display:'flex',gap:8,marginTop:4}}>
                          {cal>0?<span style={{fontSize:11,fontWeight:700,color:'#D42020'}}>{cal} kcal</span>:<span style={{fontSize:11,color:C.textMuted}}>Sin registro</span>}
                          {exs.length>0&&<span style={{fontSize:11,color:'#34C759',fontWeight:600}}>💪 {exs.length} ej.</span>}
                          {note&&<span style={{fontSize:11,color:C.textSec}}>📝</span>}
                        </div>
                      </div>
                      <div style={{fontSize:14,color:C.textMuted,transform:isSel?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</div>
                    </div>
                    {isSel&&(
                      <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,animation:'fadeUp .2s ease'}}>
                        {['Desayuno','Almuerzo','Once','Cena','Snack'].map(m=>{
                          const items=dayLog.filter(r=>r.comida===m);
                          if(!items.length) return null;
                          return(
                            <div key={m} style={{marginBottom:8}}>
                              <div style={{fontSize:11,fontWeight:700,color:C.textSec,marginBottom:4}}>{MI[m]} {m}</div>
                              {items.map((it,ii)=>(
                                <div key={ii} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}>
                                  <span style={{fontSize:15}}>{it.emoji}</span>
                                  <div style={{flex:1,fontSize:12,color:C.text}}>{it.nombre}</div>
                                  <span style={{fontSize:11,color:C.textSec}}>{Math.round(it.cal*(it.grams?it.grams/(it.porcion||100):1)*it.qty)} kcal</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {note&&<div style={{marginTop:8,padding:'8px 12px',background:C.surfaceAlt,borderRadius:10,fontSize:12,color:C.textSec,fontStyle:'italic'}}>📝 {note}</div>}
                        {dayLog.length===0&&<div style={{fontSize:12,color:C.textMuted,textAlign:'center',padding:'4px 0 2px'}}>No registraste nada este día. ¿Olvidaste una comida?</div>}
                        <div style={{display:'flex',gap:8,marginTop:12}}>
                          <button className="tap" onClick={()=>{setEditDayKey(key);haptic('light');}} style={{flex:1,padding:'11px',borderRadius:14,border:`1.5px solid #D42020`,background:'transparent',color:'#D42020',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                            ✏️ Editar este día
                          </button>
                          {dayLog.length>0&&(
                            <button className="tap" onClick={()=>{
                              setLog(dayLog.map(it=>({...it,uid:Date.now()+Math.random()})));
                              setShowHistory(false);
                              haptic('success');
                              setToast('📋 Comidas copiadas al día de hoy');
                            }} style={{flex:1,padding:'11px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                              📋 Copiar a hoy
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ACHIEVEMENT POPUP ══ */}
      {newAchiev&&(
        <div style={{
          position:'fixed',top:76,left:'50%',transform:'translateX(-50%)',
          background:'linear-gradient(135deg,#1A1A2E,#16213E,#0F3460)',
          color:'white',padding:'14px 20px',borderRadius:24,
          zIndex:150,display:'flex',alignItems:'center',gap:12,
          boxShadow:'0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
          animation:'springIn .5s cubic-bezier(.34,1.56,.64,1)',
          whiteSpace:'nowrap',
        }}>
          <div style={{width:44,height:44,borderRadius:14,background:'rgba(255,215,0,0.15)',border:'1px solid rgba(255,215,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🏆</div>
          <div>
            <div style={{fontSize:9,color:'#FFD60A',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:2}}>¡Logro desbloqueado!</div>
            <div style={{fontSize:14,fontWeight:800,lineHeight:1.2}}>{newAchiev}</div>
          </div>
        </div>
      )}

      {showAI&&<AIAssistant C={C} F={F} nombre={nombre} tot={tot} metas={metas} obj={obj} log={log} streak={streak} userAllergens={userAllergens} veganMode={veganMode} iaMemoria={iaMemoria} onIaMemoriaUpdate={setIaMemoria} isPro={isPro} meseta={detectarMeseta} onClose={()=>setShowAI(false)} onAddFood={(food)=>addFood(food)} meal={meal} condicion={perfil.condicion||'ninguna'} condiciones={condiciones} perfil={perfil} agua={agua} exercises={exercises} saludScore={saludScore} nutriPlan={nutriPlan} botOutfit={nutribotOutfit}/>}
      {showOutfitPicker&&<OutfitPicker C={C} F={F} current={botOutfitChoice}
        onPick={(id)=>{setBotOutfitChoice(id);LS.set('botOutfit',id);}}
        onClose={()=>setShowOutfitPicker(false)}/>}
      {editDayKey&&<PastDayEditor C={C} F={F} dateKey={editDayKey} allFoods={allFoods} supabaseUser={supabaseUser}
        onClose={()=>setEditDayKey(null)}
        onLogChange={(key,newLog)=>{ if(key===todayKey()) setLog(newLog); }}/>}
      {showMiPauta&&<MiPautaModal C={C} F={F} dark={dark} nutriPlan={nutriPlan} tot={tot} metas={metas} onClose={()=>setShowMiPauta(false)}/>}
      {showPaywall&&<PaywallModal C={C} F={F} dark={dark} onClose={()=>setShowPaywall(false)} supabaseUser={supabaseUser}/>}
      {showMicronutrientes&&<MicronutrientesModal C={C} F={F} log={log} onClose={()=>setShowMicronutrientes(false)}/>}
      {showRecetasIA&&<RecetasIAModal C={C} F={F} dark={dark} nombre={nombre} perfil={perfil} obj={obj} userAllergens={userAllergens} veganMode={veganMode} onClose={()=>setShowRecetasIA(false)}/>}
      {showListaComprasIA&&<ListaComprasIAModal C={C} F={F} dark={dark} log={log} userAllergens={userAllergens} veganMode={veganMode} onClose={()=>setShowListaComprasIA(false)}/>}
      {showQueComer&&<QueComerHoyModal C={C} F={F} dark={dark} tot={tot} metas={metas} log={log} obj={obj} userAllergens={userAllergens} veganMode={veganMode} ritmo={ritmo} onClose={()=>setShowQueComer(false)}/>}
      {showDesafiosComunidad&&<DesafiosComunidadModal C={C} F={F} dark={dark} log={log} agua={agua} waterGoal={waterGoal} exercises={exercises} streak={streak} tot={tot} metas={metas} supabaseUser={supabaseUser} nombre={nombre} obj={obj} onClose={()=>setShowDesafiosComunidad(false)}/>}
      {showLigaAmigos&&<LigaAmigosModal C={C} F={F} dark={dark} supabaseUser={supabaseUser} nombre={nombre} saludScore={saludScore} streak={streak} xpTotal={xpTotal} isPro={isPro} onClose={()=>setShowLigaAmigos(false)}/>}
      {showPlanAdaptativo&&<PlanAdaptativoModal C={C} F={F} dark={dark} nombre={nombre} perfil={perfil} obj={obj} metas={metas} ritmo={ritmo} weightHistory={weightHistory} streak={streak} tot={tot} onClose={()=>setShowPlanAdaptativo(false)}/>}
      {showPlanFamiliar&&<PlanFamiliarModal C={C} F={F} dark={dark} supabaseUser={supabaseUser} isPro={isPro} onClose={()=>setShowPlanFamiliar(false)}/>}
      {showPlanesDescargables&&<PlanesDescargablesModal C={C} F={F} dark={dark} nombre={nombre} perfil={perfil} obj={obj} metas={metas} ritmo={ritmo} userAllergens={userAllergens} veganMode={veganMode} onClose={()=>setShowPlanesDescargables(false)}/>}
      {showMarketplace&&<MarketplaceNutricionistasModal C={C} F={F} dark={dark} supabaseUser={supabaseUser} onClose={()=>setShowMarketplace(false)}/>}
      {showRecetasTemporada&&<RecetasTemporadaModal C={C} F={F} dark={dark} obj={obj} userAllergens={userAllergens} veganMode={veganMode} onClose={()=>setShowRecetasTemporada(false)}/>}
      {showPlanSemanal&&<PlanSemanalIAModal C={C} F={F} dark={dark} nombre={nombre} perfil={perfil} obj={obj} metas={metas} ritmo={ritmo} userAllergens={userAllergens} veganMode={veganMode} condicion={perfil.condicion||'ninguna'} condiciones={condiciones} onClose={()=>setShowPlanSemanal(false)}/>}
      {showPredicionPeso&&<PredicionPesoModal C={C} F={F} dark={dark} weightHistory={weightHistory} perfil={perfil} obj={obj} metas={metas} onClose={()=>setShowPredicionPeso(false)}/>}
      {showModoSalud&&<ModoSaludEspecialModal C={C} F={F} dark={dark} log={log} onClose={()=>setShowModoSalud(false)}/>}
      {showReporteSemanal&&<ReporteSemanalModal C={C} F={F} dark={dark} isPro={isPro} onClose={()=>setShowReporteSemanal(false)}/>}
      {showRecordatorios&&<RecordatoriosModal C={C} F={F} dark={dark} onClose={()=>setShowRecordatorios(false)}/>}
      {showWelcomeBack&&<WelcomeBack C={C} F={F} nombre={nombre} streak={streak} daysAway={daysAway} onClose={()=>setShowWelcomeBack(false)}/>}
      {showMilestone&&<MilestoneCelebration C={C} F={F} milestone={showMilestone} onClose={()=>setShowMilestone(null)}/>}
      {showLegal&&<LegalModal type={showLegal} onClose={()=>setShowLegal(null)}/>}

      {macroDetail&&<MacroDetailSheet macro={macroDetail} log={log} metas={metas} C={C} F={F} onClose={()=>setMacroDetail(null)}/>}

      {/* ══ AVATAR PICKER ══ */}
      {showAvatarPicker&&(
        <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div onClick={()=>setShowAvatarPicker(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(3px)'}}/>
          <div style={{
            position:'relative',background:C.bg,
            borderRadius:'24px 24px 0 0',
            padding:'0 0 32px',
            animation:'fadeUp .28s cubic-bezier(.34,1.56,.64,1)',
          }}>
            {/* Handle */}
            <div style={{display:'flex',justifyContent:'center',padding:'12px 0 8px'}}>
              <div style={{width:40,height:4,borderRadius:2,background:C.border}}/>
            </div>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px 14px'}}>
              <div style={{fontSize:16,fontWeight:800,color:C.text}}>Elige tu avatar</div>
              <button onClick={()=>setShowAvatarPicker(false)} style={{width:32,height:32,borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,fontSize:14,cursor:'pointer',color:C.textMuted,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            {/* Preview */}
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{
                width:80,height:80,borderRadius:24,margin:'0 auto',
                background:`linear-gradient(135deg,${C.surfaceAlt},${C.border})`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:44,border:`2px solid ${C.border}`,
              }}>{avatar}</div>
              <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>Avatar actual</div>
            </div>
            {/* Categorías de emojis */}
            {[
              {cat:'Personas',emojis:['🧑','👦','👧','👩','🧔','👩‍🦱','👨‍🦱','🧑‍🦰','👩‍🦰','🧑‍🦳','👩‍🦳','🧑‍🦲','😊','😎','🥹']},
              {cat:'Fitness',emojis:['💪','🏃','🏋️','🧘','🚴','⛹️','🤸','🏊','🥊','🎽','🏅','🥇']},
              {cat:'Comida',emojis:['🥗','🥑','🍎','🥦','🍇','🍓','🥕','🌽','🍌','🫐','🥝','🍋']},
              {cat:'Animales',emojis:['🐶','🐱','🦁','🐯','🐻','🦊','🐸','🐧','🦋','🦄','🐺','🦅']},
            ].map(({cat,emojis})=>(
              <div key={cat} style={{padding:'0 20px',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:.6,marginBottom:8}}>{cat}</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {emojis.map(e=>(
                    <button key={e} className="tap" onClick={()=>{
                      setAvatar(e);
                      LS.set('avatar',e);
                      haptic('light');
                      setTimeout(()=>setShowAvatarPicker(false),150);
                    }} style={{
                      width:46,height:46,borderRadius:14,
                      border:`2px solid ${avatar===e?'#D42020':C.border}`,
                      background:avatar===e?'#D4202018':C.surfaceAlt,
                      fontSize:24,cursor:'pointer',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      transition:'all .15s',
                    }}>{e}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRestaurant&&<RestaurantEstimator C={C} F={F} meal={meal} accent={accent} onClose={()=>setShowRestaurant(false)} onAdd={food=>{addFood(food);setShowRestaurant(false);}}/>}

      {showChallenge&&<Challenge21 C={C} F={F} streak={streak} log={log} metas={metas} onClose={()=>setShowChallenge(false)}/>}

      <Confetti active={confetti}/>

      {/* ══ MODO FERIA ══ */}
      {showModFeria&&<ModFeriaModal C={C} F={F} metas={metas} veganMode={veganMode} userAllergens={userAllergens} favorites={favorites} recent={recent} obj={obj} condicion={perfil.condicion} condiciones={condiciones} nombre={nombre} onClose={()=>setShowModFeria(false)}/>}

      {/* ══ BARCODE SCANNER ══ */}
      {showScanner&&<BarcodeScanner C={C} F={F} supabaseUser={supabaseUser} onClose={()=>setShowScanner(false)} onFound={(food)=>{
                setShowScanner(false);
                // Small delay so camera stream stops before modal mounts
                setTimeout(()=>setDetail(food), 200);
              }}/>}

      {/* ══ PHOTO FOOD SCANNER ══ */}
      {showPhotoScanner&&<FoodPhotoScanner C={C} F={F} nombre={nombre} meal={meal}
        userAllergens={userAllergens} veganMode={veganMode}
        onAdd={(food)=>addFood(food)}
        onClose={()=>setShowPhotoScanner(false)}
      />}

      {/* ══ RECIPE BUILDER ══ */}
      {showRecipe&&<RecipeBuilder C={C} F={F} allFoods={allFoods} onClose={()=>setShowRecipe(false)} onSave={(r)=>{setCustomFoods([...customFoods,r]);setShowRecipe(false);}}/>}

      {/* ══ WEEKLY PLANNER ══ */}
      {showPlanner&&<WeeklyPlanner C={C} F={F} allFoods={allFoods}
        onClose={()=>setShowPlanner(false)}
        onApplyToday={(todayPlan)=>{
          const newItems=[];
          MEALS.forEach(m=>{
            (todayPlan[m]||[]).forEach(food=>{
              const exists=log.find(r=>r.id===food.id&&r.comida===m);
              if(!exists) newItems.push({...food,comida:m,qty:1,uid:Date.now()+Math.random()});
            });
          });
          if(newItems.length>0){
            setLog(prev=>[...prev,...newItems]);
            setShowPlanner(false);
            haptic('success');
            setToast(`✓ ${newItems.length} alimento${newItems.length>1?'s':''} aplicados al diario`);
          } else {
            setToast('Ya tienes estos alimentos en el diario');
          }
        }}
      />}

      {/* ══ EXERCISE SHEET ══ */}
      {showExSheet&&<ExerciseSheet C={C} F={F} perfil={perfil} onClose={()=>setShowEx(false)} onAdd={(ex)=>{setExercises([...exercises,ex]);setShowEx(false);}}/>}

      {/* ══ CUSTOM FOOD SHEET ══ */}
      {showCustom&&<CustomFoodSheet C={C} F={F} onClose={()=>setShowCustom(false)} onSave={(f)=>{setCustomFoods([...customFoods,f]);setShowCustom(false);}}/>}

      {/* ══ HEADER ══ */}
      <div style={{
        background:C.headerBg,
        borderBottom:`1px solid ${C.border}`,
        paddingTop:'calc(12px + env(safe-area-inset-top))',
        paddingBottom:'10px',
        paddingLeft:'18px',
        paddingRight:'18px',
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
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
                <span style={{fontSize:9,fontWeight:700,color:getNivel(xpTotal).color}}>{getNivel(xpTotal).nombre}</span>
                <div style={{width:50,height:3,background:C.surfaceAlt,borderRadius:2,overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:2,background:getNivel(xpTotal).color,width:`${Math.min(100,((xpTotal-getNivel(xpTotal).xpMin)/(getNivel(xpTotal).xpMax-getNivel(xpTotal).xpMin))*100)}%`}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{textAlign:'right'}}>
              {sinCalorias?(
                <div style={{color:pct>1?'#FF3B30':pct>0.7?'#FF9500':'#34C759',fontSize:13,fontWeight:800,lineHeight:1}}>
                  {pct>1?'¡Objetivo cumplido! ✅':pct>0.7?'¡Vas muy bien! 💪':pct>0.4?'Buen inicio 🌱':'Empezando el día ☀️'}
                </div>
              ):(
                <div style={{color:C.text,fontSize:15,fontWeight:800,lineHeight:1}}>
                  {Math.round(tot.cal)}<span style={{fontSize:11,color:C.textSec,fontWeight:500}}> / {metas.cal} kcal</span>
                </div>
              )}
              {!sinCalorias&&<div style={{color:tot.cal>metas.cal?C.red:C.textSec,fontSize:10,fontWeight:600,marginTop:1}}>
                {tot.cal>metas.cal?`+${sobre} excedido`:`${reste} restantes`}
              </div>}
            </div>
            <div style={{display:'flex',gap:6}}>
              <button className="tap" onClick={()=>{ if(!isPro){setShowPaywall(true);return;} setShowAI(true); }} style={{
                width:34,height:34,borderRadius:11,border:`1px solid ${C.border}`,
                background:'#D4202018',color:'#D42020',fontSize:16,cursor:'pointer',
                fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              }}>🤖</button>
              {/* Sync status */}
              {supabaseUser&&(
                <div title={syncStatus==='syncing'?'Sincronizando...':syncStatus==='done'?'Sincronizado':syncStatus==='error'?'Error de sync':'Conectado'} style={{
                  width:34,height:34,borderRadius:10,
                  border:`1px solid ${C.border}`,
                  background:C.surfaceAlt,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                  fontSize:15,
                }}>
                  {syncStatus==='syncing'?'🔄':syncStatus==='done'?'☁️':syncStatus==='error'?'⚠️':'☁️'}
                </div>
              )}
              <button className="tap" onClick={()=>{
                  if(autoTheme){ setAutoTheme(false); LS.set('autoTheme',false); }
                  const nd=!dark; setDark(nd); LS.set('darkMode',nd);
                }} style={{
                width:34,height:34,borderRadius:10,
                border:`1px solid ${autoTheme?'#D42020':C.border}`,
                background:autoTheme?'#D4202018':C.surfaceAlt,color:C.text,
                fontSize:15,cursor:'pointer',fontFamily:F,
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                position:'relative',
              }}>
                {dark?'☀️':'🌙'}
                {autoTheme&&<div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:'#D42020'}}/>}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* thin progress bar */}
      <div style={{height:3,background:C.border,overflow:'hidden'}}>
        <div style={{
          height:'100%',
          width:`${Math.min(pct*100,100)}%`,
          background:tot.cal>metas.cal?C.red:accent,
          transition:'width .8s cubic-bezier(.25,.46,.45,.94)',
        }}/>
      </div>

      <div ref={mainRef} style={{padding:'14px 14px 0'}}>

        {/* ══════════════════════════════════
            TAB 0 — INICIO
        ══════════════════════════════════ */}
        {tab===0&&<div className={tabAnim}>

          {/* Switch profesional → volver al panel */}
          {accountType==='professional'&&(
            <button className="tap" onClick={()=>setProMode('professional')} style={{
              width:'100%',marginBottom:10,padding:'10px 16px',
              background:'#1D3557',borderRadius:16,border:'none',
              display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontFamily:F,
            }}>
              <span style={{fontSize:18}}>👩‍⚕️</span>
              <div style={{flex:1,textAlign:'left'}}>
                <div style={{fontSize:12,fontWeight:700,color:'white'}}>Modo personal activo</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>Toca para volver al panel profesional</div>
              </div>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>›</span>
            </button>
          )}

          {/* Banner fijo: escanear plato con IA */}
          <button className="tap" onClick={()=>{ if(!isPro){setShowPaywall(true);return;} setShowPhotoScanner(true); haptic('light'); }} style={{
            width:'100%',textAlign:'left',marginBottom:12,padding:'14px 16px',cursor:'pointer',fontFamily:F,
            background:'linear-gradient(135deg,#D42020,#FF6B35)',borderRadius:20,border:'none',
            display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden',
            boxShadow:'0 4px 16px rgba(212,32,32,0.28)',
          }}>
            {/* Brillo decorativo */}
            <div style={{position:'absolute',top:-30,right:-20,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.12)'}}/>
            <div style={{
              width:50,height:50,borderRadius:15,flexShrink:0,zIndex:1,
              background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,
            }}>📸</div>
            <div style={{flex:1,minWidth:0,zIndex:1}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.8)',fontWeight:800,letterSpacing:1,textTransform:'uppercase',marginBottom:2}}>Solo en Calorú 🇨🇱{!isPro?' · PRO':''}</div>
              <div style={{fontSize:15.5,fontWeight:800,color:'white',lineHeight:1.15}}>Escanea tu plato con IA</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.85)',marginTop:2}}>Foto → calorías y macros en segundos</div>
            </div>
            <span style={{
              zIndex:1,flexShrink:0,background:'white',color:'#D42020',
              borderRadius:11,padding:'8px 12px',fontSize:12,fontWeight:800,
            }}>Probar →</span>
          </button>

          {/* Banner rotativo diferenciadores */}
          {(()=>{
            const banners = [
              {bg:'linear-gradient(135deg,#1D3557,#2E6DA4)', tag:'INTELIGENCIA ARTIFICIAL', titulo:'Registra hablando naturalmente', sub:'"Me comí un completo con todo" — y listo', btn:'🤖 Hablar con Nutri', action:()=>setShowAI(true)},
              {bg:'linear-gradient(135deg,#28B044,#1a7a36)', tag:'475+ PRODUCTOS CHILENOS', titulo:'Tu comida real, tus macros exactos', sub:'Cazuela, marraqueta, sopaipilla y mucho más', btn:'🇨🇱 Buscar alimento', action:()=>setTab(1)},
              {bg:'linear-gradient(135deg,#5856D6,#AF52DE)', tag:'PLAN NUTRICIONAL', titulo:'Tu nutricionista en el bolsillo', sub:'Vincula tu plan profesional y sigue tus metas', btn:'👩‍⚕️ Ver plan', action:()=>setTab(4)},
            ];
            const b = banners[bannerIdx];
            return(
              <div style={{background:b.bg,borderRadius:20,padding:'14px 16px',marginBottom:12,position:'relative',overflow:'hidden'}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.7)',fontWeight:700,letterSpacing:1.2,marginBottom:4,textTransform:'uppercase'}}>{b.tag}</div>
                <div style={{fontSize:15,fontWeight:800,color:'white',lineHeight:1.2,marginBottom:4}}>{b.titulo}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.75)',marginBottom:10,lineHeight:1.4}}>{b.sub}</div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <button className="tap" onClick={b.action} style={{background:'rgba(255,255,255,0.2)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:10,padding:'6px 14px',color:'white',fontFamily:F,cursor:'pointer',fontSize:11,fontWeight:700}}>
                    {b.btn}
                  </button>
                  <div style={{display:'flex',gap:4}}>
                    {banners.map((_,i)=>(
                      <div key={i} onClick={()=>setBannerIdx(i)} style={{width:i===bannerIdx?16:5,height:5,borderRadius:3,background:i===bannerIdx?'white':'rgba(255,255,255,0.4)',transition:'all .3s',cursor:'pointer'}}/>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Card plan del nutricionista */}
          {nutriPlan&&accountType==='personal'&&(
            <div style={{background:'#1D355710',borderRadius:20,padding:'14px 16px',marginBottom:12,border:'1px solid #1D355730'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:'#1D355720',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>👩‍⚕️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1D3557'}}>{nutriPlan.nutricionista_nombre||'Tu nutricionista'}</div>
                  <div style={{fontSize:10,color:'#34C759',marginTop:1,fontWeight:700}}>⭐ Pro activado</div>
                </div>
                {nutriPlan.calorias_meta&&<div style={{fontSize:11,fontWeight:700,color:'#1D3557'}}>{nutriPlan.calorias_meta} kcal/día</div>}
              </div>
              {nutriPlan.mensaje&&(
                <div style={{background:'white',borderRadius:12,padding:'10px 12px',marginBottom:10,border:'1px solid #1D355720'}}>
                  <div style={{fontSize:11,color:'#1D3557',lineHeight:1.5,fontStyle:'italic'}}>"{nutriPlan.mensaje}"</div>
                </div>
              )}
              {(()=>{ const nPlanMac = normalizeRecs(nutriPlan.recomendaciones).macros; const tieneMac = nPlanMac.prot!=null||nPlanMac.carbs!=null||nPlanMac.grasas!=null; return tieneMac&&(
                <div style={{display:'flex',gap:6,marginBottom:10}}>
                  {[{l:'Prot',v:nPlanMac.prot,c:'#34C759'},{l:'Carbs',v:nPlanMac.carbs,c:'#FF9500'},{l:'Lípidos',v:nPlanMac.grasas,c:'#5856D6'}].map(({l,v,c})=>(
                    <div key={l} style={{flex:1,background:'white',borderRadius:10,padding:'7px 6px',textAlign:'center',border:'1px solid #1D355720',borderTop:`3px solid ${c}`}}>
                      <div style={{fontSize:14,fontWeight:800,color:'#1D3557'}}>{v!=null?v:'—'}<span style={{fontSize:9,fontWeight:600,color:C.textSec}}>g</span></div>
                      <div style={{fontSize:9,color:C.textSec,fontWeight:600}}>{l}</div>
                    </div>
                  ))}
                </div>
              ); })()}
              {recsToArray(nutriPlan.recomendaciones).length>0&&(
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:'#1D3557',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>Tu pauta</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {recsToArray(nutriPlan.recomendaciones).filter(r=>{
                      // Filtrar recomendaciones que contradigan alergias
                      const tipo = (r.tipo||'').toLowerCase();
                      if(userAllergens.includes('gluten') && (tipo.includes('pan')||tipo.includes('trigo')||tipo.includes('cereal'))) return false;
                      if(userAllergens.includes('lacteos') && (tipo.includes('leche')||tipo.includes('queso')||tipo.includes('yogur')||tipo.includes('lácteo'))) return false;
                      if(userAllergens.includes('mariscos') && (tipo.includes('marisco')||tipo.includes('camarón')||tipo.includes('pescado'))) return false;
                      if(userAllergens.includes('huevo') && tipo.includes('huevo')) return false;
                      if(userAllergens.includes('frutos_secos') && (tipo.includes('nuez')||tipo.includes('almendra')||tipo.includes('fruto seco'))) return false;
                      if(veganMode && (tipo.includes('carne')||tipo.includes('pollo')||tipo.includes('pescado')||tipo.includes('lácteo')||tipo.includes('leche')||tipo.includes('huevo'))) return false;
                      return true;
                    }).map((r,i)=>(
                      <div key={i} style={{background:'white',borderRadius:10,padding:'5px 10px',border:'1px solid #1D355720'}}>
                        <div style={{fontSize:11,fontWeight:700,color:'#1D3557'}}>{r.tipo}</div>
                        <div style={{fontSize:9,color:C.textSec}}>{r.porcion}{r.hora?` · 🕐 ${r.hora}`:''}</div>
                      </div>
                    ))}
                  </div>
                  {userAllergens.length>0&&(
                    <div style={{fontSize:9,color:C.textSec,marginTop:6,fontStyle:'italic'}}>
                      ✓ Filtrado según tus alergias e intolerancias
                    </div>
                  )}
                </div>
              )}
              <button className="tap" onClick={()=>{setShowMiPauta(true);haptic('light');}} style={{
                width:'100%',marginTop:10,padding:'11px',borderRadius:13,border:'none',
                background:'#1D3557',color:'white',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:F,
              }}>
                📋 Ver mi pauta y progreso →
              </button>
            </div>
          )}

          {/* ── HERO: SALUD SCORE / SIN CALORÍAS ── */}
          {sinCalorias?(
          <div style={{background:C.surface,borderRadius:24,padding:'18px 20px',marginBottom:12,border:`1px solid ${C.border}`}}>
            {(()=>{
              const emoji = pct>1?'🟢':pct>0.7?'🟡':pct>0.3?'🟠':'🔴';
              const msg   = pct>1?'¡Objetivo cumplido!':pct>0.7?'Buen progreso':pct>0.3?'Vas en camino':'Empieza a registrar';
              const col   = pct>1?'#34C759':pct>0.7?'#FF9500':pct>0.3?'#FF6B00':'#FF3B30';
              const macroStatus=(val,meta)=>val/meta>0.9?{label:'Bien',bg:'#34C75918',col:'#1a7a36'}:val/meta>0.6?{label:'Ok',bg:'#FF950018',col:'#a05e00'}:{label:'Bajo',bg:'#FF3B3018',col:'#a01a1a'};
              const pSt=macroStatus(tot.prot,  metas.prot);
              const cSt=macroStatus(tot.carbs, metas.carbs);
              const gSt=macroStatus(tot.grasas,metas.grasas);
              return(<>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
                  <div style={{fontSize:44,lineHeight:1}}>{emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:18,fontWeight:800,color:col,lineHeight:1.1}}>{msg}</div>
                    <div style={{height:5,background:C.border,borderRadius:3,overflow:'hidden',marginTop:8}}>
                      <div style={{height:'100%',width:`${Math.min(pct*100,100)}%`,background:col,borderRadius:3,transition:'width .5s'}}/>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'space-around'}}>
                  {[{icon:'💪',label:'Proteína',st:pSt},{icon:'⚡',label:'Energía',st:cSt},{icon:'🥑',label:'Grasas',st:gSt}].map(({icon,label,st})=>(
                    <div key={label} style={{textAlign:'center'}}>
                      <div style={{fontSize:22,marginBottom:3}}>{icon}</div>
                      <div style={{fontSize:9,color:C.textSec,marginBottom:3}}>{label}</div>
                      <div style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:10,background:st.bg,color:st.col}}>{st.label}</div>
                    </div>
                  ))}
                </div>
              </>);
            })()}
          </div>
          ):(
          <>

          <div style={{
            background:C.surface,borderRadius:24,padding:'18px 20px',marginBottom:12,
            border:`1px solid ${C.border}`,
            boxShadow:dark?'none':'0 2px 20px rgba(0,0,0,0.07)',
            position:'relative',overflow:'hidden',
          }}>
            <div style={{position:'absolute',top:-30,right:-30,width:110,height:110,borderRadius:'50%',background:`${scoreColor(saludScore)}08`,pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{flexShrink:0,position:'relative',width:72,height:72}}>
                <svg width={72} height={72} viewBox="0 0 72 72">
                  <circle cx={36} cy={36} r={30} fill="none" stroke={C.border} strokeWidth={7}/>
                  <circle cx={36} cy={36} r={30} fill="none"
                    stroke={scoreColor(saludScore)} strokeWidth={7}
                    strokeDasharray={`${(saludScore/100)*188.5} 188.5`}
                    strokeLinecap="round" transform="rotate(-90 36 36)"
                    style={{transition:'stroke-dasharray 1.2s cubic-bezier(.34,1.56,.64,1)'}}/>
                </svg>
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontSize:19,fontWeight:800,color:scoreColor(saludScore),lineHeight:1}}>{saludScore}</div>
                  <div style={{fontSize:8,color:C.textMuted,fontWeight:600,letterSpacing:.5}}>PTS</div>
                </div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:17,fontWeight:800,color:C.text,letterSpacing:'-.4px',lineHeight:1.2}}>{SALUDO}, {primerNombre} 👋</div>
                <div style={{fontSize:13,color:scoreColor(saludScore),fontWeight:700,marginTop:3}}>{scoreLabel(saludScore)}</div>
                <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>Salud Score · {new Date().toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'})}  </div>
              </div>
              <div style={{flexShrink:0,textAlign:'center',background:streak.days>0?`${C.red}12`:C.surfaceAlt,borderRadius:14,padding:'8px 10px',border:`1px solid ${streak.days>0?C.red+'30':C.border}`}}>
                <div style={{fontSize:18}}>🔥</div>
                <div style={{fontSize:15,fontWeight:800,color:streak.days>0?C.red:C.textMuted,lineHeight:1}}>{streak.days}</div>
                <div style={{fontSize:9,color:C.textMuted,fontWeight:500}}>días</div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:12}}>
              {[
                {l:'Cal',pts:(()=>{if(!metas.cal)return 0;const cp=tot.cal/metas.cal;return cp>=0.85&&cp<=1.08?30:cp>=0.65?18:cp>0?8:0;})(),max:30,c:'#D42020'},
                {l:'Prot',pts:metas.prot>0?(tot.prot/metas.prot>=0.85?20:tot.prot/metas.prot>=0.6?12:tot.prot>0?5:0):0,max:20,c:C.red},
                {l:'Agua',pts:agua>=8?15:agua>=5?9:agua>=2?4:0,max:15,c:'#5AC8FA'},
                {l:'Ejerce',pts:(()=>{const b=exercises.reduce((s,e)=>s+e.burn,0);return b>=300?20:b>=150?13:b>0?6:0;})(),max:20,c:'#34C759'},
              ].map(({l,pts,max,c})=>(
                <div key={l} style={{background:C.surfaceAlt,borderRadius:10,padding:'7px 5px',textAlign:'center'}}>
                  <div style={{fontSize:12,fontWeight:800,color:pts>0?c:C.textMuted,lineHeight:1}}>{pts}<span style={{fontSize:8,color:C.textMuted}}>/{max}</span></div>
                  <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
            {(dailyInsight||insightLoading)&&(
              <div style={{marginTop:10,background:dark?'rgba(255,255,255,.04)':'rgba(0,0,0,.025)',borderRadius:12,padding:'9px 12px',borderLeft:`3px solid ${scoreColor(saludScore)}`}}>
                {insightLoading
                  ?<div style={{fontSize:12,color:C.textMuted,fontStyle:'italic'}}>✨ Preparando tu insight del día...</div>
                  :<div style={{fontSize:12,color:C.text,lineHeight:1.55,fontWeight:500}}>{dailyInsight}</div>
                }
              </div>
            )}
          </div>

          {/* ── RETO DEL DÍA ── */}
          <DailyChallengeCard C={C} F={F} log={log} agua={agua}/>

          {/* ── COMPARAR CON AYER ── */}
          {(()=>{
            const prev=new Date(); prev.setDate(prev.getDate()-1);
            const prevKey=dateToKey(prev);
            const summary=LS.get('summary_'+prevKey,null);
            if(!summary||summary.items===0) return null;
            const diff=Math.round(tot.cal)-summary.cal;
            return(
              <div style={{background:C.surface,borderRadius:18,padding:'12px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>📊 Vs ayer</div>
                  <button className="tap" onClick={()=>setShowHistory(true)} style={{fontSize:11,color:'#D42020',background:'none',border:'none',cursor:'pointer',fontFamily:F,fontWeight:600}}>Historial →</button>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{flex:1,background:C.surfaceAlt,borderRadius:12,padding:'8px 10px'}}>
                    <div style={{fontSize:10,color:C.textMuted,marginBottom:1}}>Hoy</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.text,lineHeight:1}}>{Math.round(tot.cal)}<span style={{fontSize:9,color:C.textMuted}}> kcal</span></div>
                  </div>
                  <div style={{flexShrink:0,padding:'5px 10px',borderRadius:10,background:diff<-50?'#34C75918':diff>100?'#FF3B3018':'#F2F2F7',color:diff<-50?'#34C759':diff>100?'#FF3B30':C.textSec,fontSize:12,fontWeight:800}}>
                    {diff>0?'+':''}{diff}
                  </div>
                  <div style={{flex:1,background:C.surfaceAlt,borderRadius:12,padding:'8px 10px',textAlign:'right'}}>
                    <div style={{fontSize:10,color:C.textMuted,marginBottom:1}}>Ayer</div>
                    <div style={{fontSize:18,fontWeight:800,color:C.textSec,lineHeight:1}}>{summary.cal}<span style={{fontSize:9,color:C.textMuted}}> kcal</span></div>
                  </div>
                </div>
                {diff<-100&&<div style={{fontSize:11,color:'#34C759',fontWeight:600,marginTop:6}}>✨ {Math.abs(diff)} kcal menos que ayer</div>}
                {diff>150&&<div style={{fontSize:11,color:'#FF9500',fontWeight:600,marginTop:6}}>⚡ {diff} kcal más que ayer</div>}
              </div>
            );
          })()}

          </>
          )}

          {/* ── TIPS NUTRICIONALES ── */}
          {tips.length>0&&(
            <div style={{marginBottom:12}}>
              {tips.map((tip,i)=>(
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:10,
                  background:C.surface,borderRadius:16,padding:'11px 14px',
                  marginBottom:i<tips.length-1?7:0,
                  border:`1px solid ${tip.color}30`,
                  borderLeft:`3px solid ${tip.color}`,
                }}>
                  <span style={{fontSize:20,flexShrink:0}}>{tip.icon}</span>
                  <div style={{fontSize:12,color:C.text,fontWeight:500,lineHeight:1.4}}>{tip.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── CALORIE RING HERO ── */}
          <div className="s1 card-in" style={{
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
                    stroke={tot.cal>metas.cal?C.red:accent} strokeWidth={11}
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
                {[
                  {l:'Prot',  v:tot.prot,         m:metas.prot,  c:C.red},
                  {l:'Carbs', v:tot.carbs,         m:metas.carbs, c:C.amber},
                  {l:'Grasas',v:tot.grasas,        m:metas.grasas,c:C.purple},
                  {l:'Azúcar',v:tot.azucar||0,     m:25,          c:'#FF6B6B', warn:true},
                ].map(({l,v,m,c,warn})=>{
                  const pct2=m>0?Math.min((v||0)/m*100,100):0;
                  const isOver=warn&&(v||0)>m;
                  return(
                    <div key={l} style={{marginBottom:7}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:10,color:isOver?'#FF3B30':C.textSec,fontWeight:isOver?700:500}}>{l}{isOver?' ⚠️':''}</span>
                        <span style={{fontSize:10,color:isOver?'#FF3B30':C.text,fontWeight:700}}>{Math.round(v||0)}<span style={{color:C.textMuted,fontWeight:400}}>/{m}g</span></span>
                      </div>
                      <div style={{height:3,background:C.border,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct2}%`,background:isOver?'#FF3B30':c,borderRadius:3,transition:'width .6s cubic-bezier(.25,.46,.45,.94)'}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── CTA cuando no hay registros ── */}
          {log.length===0&&(
            <div style={{
              background:`linear-gradient(135deg,${C.primary}08,${C.primary}04)`,
              borderRadius:20,padding:'16px',marginBottom:12,
              border:`1.5px dashed ${C.primary}30`,
              display:'flex',alignItems:'center',gap:14,
            }}>
              <div style={{fontSize:32,flexShrink:0}}>🥗</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>¿Qué comiste hoy?</div>
                <div style={{fontSize:11,color:C.textSec,lineHeight:1.4}}>Registra tu primera comida y empieza a cuidar tu salud</div>
              </div>
              <button className="tap" onClick={()=>setTab(1)} style={{
                flexShrink:0,padding:'9px 14px',borderRadius:14,border:'none',
                background:'#D42020',color:'white',
                fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:F,
                boxShadow:'0 4px 12px rgba(0,122,255,0.3)',
              }}>Agregar</button>
            </div>
          )}

          {/* ── 4 MACRO CARDS ── */}
          <div className="s2 card-in-1" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}}>
            {[
              {k:'prot',   lS:'Prot',   c:C.red,     meta:metas.prot},
              {k:'carbs',  lS:'Carbs',  c:C.amber,   meta:metas.carbs},
              {k:'grasas', lS:'Grasas', c:C.purple,  meta:metas.grasas},
              {k:'fibra',  lS:'Fibra',  c:C.green,   meta:25},
              {k:'azucar', lS:'Azúcar', c:'#FF6B6B', meta:25},
            ].map(({k,lS,c:col,meta})=>{
              const v=tot[k]||0, m=meta, p2=m>0?Math.min(v/m*100,100):0;
              const def=MACRO_DEFS.find(d=>d.key===k);
              return (
                <div key={k} className="tap" onClick={()=>def&&setMacroDetail(def)} style={{
                  background:C.surface,borderRadius:18,
                  border:`1px solid ${C.border}`,
                  overflow:'hidden',cursor:'pointer',
                  boxShadow:dark?'none':'0 1px 8px rgba(0,0,0,0.05)',
                  transition:'transform .15s',
                  WebkitTapHighlightColor:'transparent',
                }}>
                  <div style={{height:3,background:C.border}}>
                    <div style={{height:'100%',width:`${p2}%`,background:col,transition:'width .7s cubic-bezier(.25,.46,.45,.94)'}}/>
                  </div>
                  <div style={{padding:'10px 8px 10px',textAlign:'center',background:k==='azucar'&&v>m?'#FF3B3008':'transparent'}}>
                    <div style={{fontSize:20,fontWeight:800,color:k==='azucar'&&v>m?'#FF3B30':C.text,lineHeight:1,letterSpacing:'-.5px'}}>{Math.round(v)}</div>
                    <div style={{fontSize:8,color:C.textMuted,fontWeight:500,marginBottom:4}}>/{m}{k==='sodio'?'mg':'g'}</div>
                    <div style={{fontSize:9,color:k==='azucar'&&v>m?'#FF3B30':col,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>{lS}{k==='azucar'&&v>m?' ⚠️':''}</div>
                  </div>
                </div>
              );
            })}
          </div>


          {/* ── ALERTA MESETA ── */}
          {detectarMeseta&&(
            <div style={{
              background:'linear-gradient(135deg,#5856D6,#AF52DE)',
              borderRadius:20,padding:'14px 16px',marginBottom:12,
              color:'white',
            }}>
              <div style={{fontSize:13,fontWeight:800,marginBottom:4}}>
                ⚠️ Llevas {detectarMeseta.diasEstancado} días en meseta
              </div>
              <div style={{fontSize:12,opacity:0.9,marginBottom:8}}>
                Tu peso apenas ha cambiado ({detectarMeseta.cambio}kg). Es normal, ¡tu cuerpo se adaptó!
              </div>
              <div style={{fontSize:11,opacity:0.8}}>
                💡 {detectarMeseta.tipo==='bajada'
                  ? 'Prueba: aumentar proteína, cambiar el tipo de ejercicio o hacer una semana de recarga calórica.'
                  : 'Prueba: aumentar calorías gradualmente o cambiar el tipo de entrenamiento.'}
              </div>
            </div>
          )}

          {/* ── BANNER PRO (solo para usuarios free) ── */}
          {!isPro&&(
            <button className="tap" onClick={()=>setShowPaywall(true)} style={{
              width:'100%',marginBottom:12,padding:0,border:'none',background:'none',cursor:'pointer',fontFamily:F,
            }}>
              <div style={{
                borderRadius:20,overflow:'hidden',
                background:'linear-gradient(135deg, #D42020 0%, #FF6B35 50%, #FFD700 100%)',
                padding:'18px 20px',
                display:'flex',alignItems:'center',justifyContent:'space-between',
                boxShadow:'0 4px 20px rgba(212,32,32,0.35)',
                position:'relative',
              }}>
                <div style={{position:'absolute',top:-20,right:-20,fontSize:80,opacity:0.1}}>⭐</div>
                <div style={{textAlign:'left',zIndex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.8)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Calorú Pro</div>
                  <div style={{fontSize:17,fontWeight:800,color:'white',lineHeight:1.3,marginBottom:8}}>Hazte Pro y empieza a escanear tus platos 📸</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {['🤖 IA','📸 Escáner','🇨🇱 Recetas','🛒 Lista'].map(f=>(
                      <span key={f} style={{fontSize:10,fontWeight:700,background:'rgba(255,255,255,0.2)',color:'white',padding:'3px 8px',borderRadius:8}}>{f}</span>
                    ))}
                  </div>
                </div>
                <div style={{zIndex:1,flexShrink:0,marginLeft:12}}>
                  <div style={{background:'white',borderRadius:14,padding:'10px 14px',textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.2)'}}>
                    <div style={{fontSize:11,fontWeight:800,color:'#D42020'}}>desde</div>
                    <div style={{fontSize:18,fontWeight:900,color:'#D42020',lineHeight:1}}>$3.500</div>
                    <div style={{fontSize:9,fontWeight:700,color:'#D42020',opacity:0.7}}>CLP/mes</div>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* ── BOTÓN MICRONUTRIENTES PRO ── */}
          <button className="tap" onClick={()=>{ if(!isPro){setShowPaywall(true);return;} setShowMicronutrientes(true); }} style={{
            width:"100%",padding:"12px 16px",borderRadius:16,marginBottom:12,
            border:`1.5px solid ${isPro?"#FFD700":"#D42020"}`,
            background:isPro?"rgba(255,215,0,0.08)":"rgba(212,32,32,0.06)",
            display:"flex",alignItems:"center",justifyContent:"space-between",
            cursor:"pointer",fontFamily:F,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>📊</span>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Análisis de Micronutrientes</div>
                <div style={{fontSize:11,color:C.textSec}}>Fibra, sodio, azúcar y más</div>
              </div>
            </div>
            {isPro?<span style={{fontSize:11,fontWeight:700,color:"#FFD700"}}>⭐ PRO</span>:<span style={{fontSize:11,fontWeight:700,color:"#D42020"}}>🔒 PRO</span>}
          </button>
          {/* ── WATER TRACKER ── */}
          <div className="s3 card-in-2" style={{
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
                    {agua>=waterGoal?'¡Meta cumplida! 🎉':`${agua} de ${waterGoal} vasos`}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{
                  background:'#D4202018',borderRadius:12,padding:'5px 12px',
                  display:'flex',alignItems:'baseline',gap:2,
                }}>
                  <span style={{fontSize:20,fontWeight:800,color:'#D42020'}}>{agua}</span>
                  <span style={{fontSize:11,color:'#D42020',fontWeight:500,opacity:.6}}>/{waterGoal}</span>
                </div>
                <div style={{display:'flex',gap:2}}>
                  <button onClick={()=>setWaterGoal(g=>Math.max(4,g-1))} style={{width:22,height:22,borderRadius:6,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F}}>−</button>
                  <button onClick={()=>setWaterGoal(g=>Math.min(16,g+1))} style={{width:22,height:22,borderRadius:6,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:F}}>+</button>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {Array.from({length:waterGoal}).map((_,i)=>(
                <button key={i} className="tap" onClick={()=>{setAgua(i<agua?i:i+1);haptic('light');}} style={{
                  flex:'0 0 calc(12.5% - 4px)',minWidth:24,height:32,borderRadius:8,border:'none',cursor:'pointer',
                  background:i<agua?'#D42020':'#D4202018',
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

          {/* ── NOTA + FOTO DEL DÍA ── */}
          <div style={{background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:12,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 1px 6px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>📝</span>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>Nota del día</div>
              </div>
              <label className="tap" style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:12,border:`1px solid ${C.border}`,background:C.surfaceAlt,cursor:'pointer',fontSize:11,fontWeight:600,color:C.textSec}}>
                <span>📷</span>{dayPhoto?'Cambiar':'Foto'}
                <input type="file" accept="image/*" capture="environment" style={{display:'none'}} onChange={e=>{
                  const file=e.target.files?.[0]; if(!file) return;
                  const reader=new FileReader();
                  reader.onload=ev=>{setDayPhoto(ev.target.result);haptic('success');setToast('📷 Foto guardada');};
                  reader.readAsDataURL(file);
                }}/>
              </label>
            </div>
            {dayPhoto&&(
              <div style={{position:'relative',marginBottom:10}}>
                <img src={dayPhoto} alt="Foto del día" style={{width:'100%',borderRadius:12,maxHeight:160,objectFit:'cover',display:'block'}}/>
                <button className="tap" onClick={()=>setDayPhoto('')} style={{position:'absolute',top:6,right:6,width:26,height:26,borderRadius:8,border:'none',background:'rgba(0,0,0,0.5)',color:'white',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
              </div>
            )}
            <textarea value={dayNote} onChange={e=>setDayNote(e.target.value)}
              placeholder="¿Cómo te sientes hoy? Escribe algo..."
              style={{width:'100%',minHeight:60,padding:'10px 12px',border:`1px solid ${C.border}`,borderRadius:13,fontSize:13,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',resize:'none',lineHeight:1.5}}/>
          </div>

          {/* ── MEAL CARDS ── */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:12,letterSpacing:'-.3px'}}>Comidas de hoy</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {MEALS.map(m=>{
                const items=log.filter(r=>r.comida===m);
                const cal=items.reduce((s,r)=>s+r.cal*itemRatio(r)*r.qty,0);
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
                          <span style={{fontSize:10,color:C.textSec,fontWeight:600}}>P:{Math.round(items.reduce((s,r)=>s+r.prot*itemRatio(r)*r.qty,0))}g C:{Math.round(items.reduce((s,r)=>s+r.carbs*itemRatio(r)*r.qty,0))}g</span>
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

          {/* Macro bar for current meal */}
          {(()=>{
            const ml=log.filter(r=>r.comida===meal);
            if(!ml.length) return null;
            const mt=sumLog(ml);
            return(
              <div style={{background:accent+'12',borderRadius:14,padding:'8px 14px',marginBottom:10,border:`1px solid ${accent}30`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:12,color:C.text,fontWeight:600}}>{meal}: <strong style={{color:accent}}>{Math.round(mt.cal)} kcal</strong></span>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:10,color:C.red,fontWeight:600}}>P:{Math.round(mt.prot)}g</span>
                  <span style={{fontSize:10,color:C.amber,fontWeight:600}}>C:{Math.round(mt.carbs)}g</span>
                </div>
              </div>
            );
          })()}

          {/* Search */}
          <div style={{position:'relative',marginBottom:10}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:.35,pointerEvents:'none'}}>🔍</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar producto o marca..."
              style={{width:'100%',padding:'12px 40px 12px 42px',border:`1.5px solid ${q?C.primary:C.border}`,borderRadius:16,background:C.surface,fontSize:14,fontFamily:F,color:C.text,outline:'none',fontWeight:500,transition:'border-color .2s'}}/>
            {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',fontSize:20,cursor:'pointer',color:C.textMuted,lineHeight:1}}>×</button>}
          </div>
          <button className="tap" onClick={()=>setShowFilter(!showFilter)} style={{
            padding:'11px 14px',borderRadius:14,marginBottom:8,
            border:`1.5px solid ${(searchSort!=='default'||searchMaxCal>0)?'#D42020':C.border}`,
            background:(searchSort!=='default'||searchMaxCal>0)?'#D4202018':C.surfaceAlt,
            color:(searchSort!=='default'||searchMaxCal>0)?'#D42020':C.textSec,
            fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
            display:'flex',alignItems:'center',gap:6,
          }}>⚙️ Filtros {searchSort!=='default'||searchMaxCal>0?'•':''}</button>
          {showFilter&&(
            <div style={{background:C.surface,borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1px solid ${C.border}`,animation:'fadeUp .2s ease'}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Ordenar por</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                {[{v:'default',l:'Relevancia'},{v:'cal_asc',l:'Menos kcal'},{v:'cal_desc',l:'Más kcal'},{v:'prot_desc',l:'Más proteína'},{v:'name',l:'A-Z'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setSearchSort(v)} style={{padding:'6px 12px',borderRadius:12,border:'none',background:searchSort===v?'#D42020':C.surfaceAlt,color:searchSort===v?'white':C.textSec,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F}}>{l}</button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Máx. calorías</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[0,100,200,300,500].map(v=>(
                  <button key={v} className="tap" onClick={()=>setSearchMaxCal(v)} style={{padding:'6px 12px',borderRadius:12,border:'none',background:searchMaxCal===v?'#D42020':C.surfaceAlt,color:searchMaxCal===v?'white':C.textSec,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F}}>{v===0?'Sin límite':'≤'+v}</button>
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
                background:cat===c?'#D42020':C.surfaceAlt,
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
                    <div style={{fontSize:10,fontWeight:800,color:'#D42020',marginTop:2}}>{a.cal}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            <button className="tap" onClick={()=>{ if(!isPro){setShowPaywall(true);return;} setShowPhotoScanner(true); }} style={{
              padding:'14px 12px',borderRadius:16,
              border:'1.5px solid #D4202050',
              background:dark?'rgba(0,122,255,0.12)':'rgba(0,122,255,0.06)',
              color:'#D42020',fontSize:12,fontWeight:700,
              cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              gridColumn:'1 / -1',
            }}>
              <span style={{fontSize:20}}>📸</span> Escanear plato con IA
              <span style={{fontSize:9,fontWeight:700,background:'#D42020',color:'white',padding:'2px 6px',borderRadius:6,marginLeft:2}}>NUEVO</span>
            </button>
            <button className="tap" onClick={()=>setShowRestaurant(true)} style={{
              padding:'12px',borderRadius:16,border:`1px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,fontSize:12,fontWeight:600,
              cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>🍽️</span> Estimador rápido
            </button>
            <button className="tap" onClick={()=>setShowScanner(true)} style={{
              padding:'12px',borderRadius:16,
              border:`1.5px solid ${C.border}`,
              background:C.surfaceAlt,color:C.text,
              fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span style={{fontSize:18}}>📷</span> Escanear código
            </button>
            <button className="tap" onClick={()=>setShowModFeria(true)} style={{
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,
              padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',fontFamily:F,width:'100%',textAlign:'left',
              gridColumn:'1 / -1',
            }}>
              <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#D42020,#FF6B35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🛒</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>Modo Feria</div>
                <div style={{fontSize:11,color:C.textSec}}>Plan semanal según tu presupuesto</div>
              </div>
              <div style={{background:'#D4202015',color:'#D42020',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:8}}>NUEVO</div>
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

          <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:10,display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
            <span>{foods.length} productos</span>
            {userAllergens.length>0&&<span style={{color:'#FF9500',fontWeight:700}}>⚠️ Filtrando {userAllergens.length} alérgeno{userAllergens.length>1?'s':''}</span>}
            {veganMode&&<span style={{color:'#34C759',fontWeight:700}}>🌱 Solo veganos</span>}
          </div>

          {/* Food list */}
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {foods.length===0&&q.length>1&&(
              <div style={{textAlign:'center',padding:'32px 20px'}}>
                <div style={{fontSize:36,marginBottom:10}}>🔍</div>
                <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Sin resultados para "{q}"</div>
                <div style={{fontSize:12,color:C.textSec,marginBottom:14}}>Puedes escanearlo o crearlo manualmente</div>
                <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                  <button className="tap" onClick={()=>setShowScanner(true)} style={{padding:'10px 16px',borderRadius:14,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>📷 Escanear</button>
                  <button className="tap" onClick={()=>setShowCustom(true)} style={{padding:'10px 16px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>✏️ Crear manualmente</button>
                </div>
              </div>
            )}
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
                    <div style={{fontSize:10,color:C.textMuted,fontWeight:500,marginTop:1,display:'flex',alignItems:'center',gap:5}}>
                      <span>{a.marca} · {a.cat}</span>
                      {(a.origen==='escaneado'||a.barcode)&&<span style={{fontSize:9,fontWeight:700,color:'#34C759',background:'#34C75918',padding:'1px 5px',borderRadius:5,flexShrink:0}}>📷 tuyo</span>}
                      {isVegan(a)&&<span style={{fontSize:9,fontWeight:700,color:'#34C759',background:'#34C75918',padding:'1px 6px',borderRadius:5,flexShrink:0}}>🌱 vegano</span>}
                    </div>
                    <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.primary}}>{a.cal} kcal</span>
                      {[{k:'prot',c:C.red},{k:'carbs',c:C.amber},{k:'grasas',c:C.purple}].map(({k,c})=>(
                        <span key={k} style={{fontSize:10,fontWeight:700,color:c,background:`${c}18`,padding:'1px 6px',borderRadius:6}}>{k[0].toUpperCase()}:{a[k]}g</span>
                      ))}
                      {getFoodAllergens(a).map(al=>{
                        const info=ALLERGENS.find(x=>x.k===al);
                        if(!info) return null;
                        return <span key={al} style={{fontSize:9,fontWeight:700,color:info.color,background:info.color+'18',padding:'1px 7px',borderRadius:6,border:`1px solid ${info.color}40`}}>{info.icon} {info.label}</span>;
                      })}
                    </div>
                  </div>
                  <div style={{
                    width:36,height:36,borderRadius:11,
                    background:inLog?MC[meal]:'#D42020',
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
                  {l:'Proteínas',     v:Math.round(tot.prot),   m:metas.prot,  c:C.red,    k:'prot'},
                  {l:'Carbohidratos', v:Math.round(tot.carbs),  m:metas.carbs, c:C.amber,  k:'carbs'},
                  {l:'Grasas',        v:Math.round(tot.grasas), m:metas.grasas,c:C.purple, k:'grasas'},
                  {l:'Fibra',         v:Math.round(tot.fibra),  m:25,          c:C.green,  k:'fibra'},
                ].map(({l,v,m,c,k})=>{
                  const def = MACRO_DEFS.find(d=>d.key===k);
                  return (
                  <div key={l} className="tap" onClick={()=>setMacroDetail(def)}
                    style={{marginBottom:8,cursor:'pointer',borderRadius:8,padding:'3px 6px',transition:'background .15s',
                      background:'transparent',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.surfaceAlt}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:10,color:C.textSec,fontWeight:500}}>{l}</span>
                      <span style={{fontSize:10,color:C.text,fontWeight:700}}>{v}<span style={{color:C.textMuted}}>/{m}g</span></span>
                    </div>
                    <div style={{height:3,background:C.border,borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${m>0?Math.min(v/m*100,100):0}%`,background:c,borderRadius:3,transition:'width .5s'}}/>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Acciones Mi Día */}
          <div style={{display:'flex',gap:8,marginBottom:14}}>
            {[
              {icon:'📅',l:'Historial',fn:()=>setShowHistory(true)},
              {icon:'✏️',l:'Editar día',fn:()=>{const d=new Date();d.setDate(d.getDate()-1);setEditDayKey(dateToKey(d));haptic('light');}},
              {icon:'📊',l:'Semana',fn:()=>setShowWeekly(true)},
              {icon:'📤',l:'Compartir',fn:()=>setShowShare(true)},
            ].map(({icon,l,fn})=>(
              <button key={l} className="tap" onClick={fn} style={{flex:1,padding:'11px 8px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surface,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',fontFamily:F}}>
                <span style={{fontSize:20}}>{icon}</span>
                <span style={{fontSize:11,fontWeight:600,color:C.textSec}}>{l}</span>
              </button>
            ))}
          </div>

          {/* 😊 Mood del día */}
          <div style={{background:C.surface,borderRadius:20,padding:'14px 16px',marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>¿Cómo te sientes hoy?</div>
              {moodEntries.length>0&&<div style={{fontSize:10,color:C.textMuted}}>{moodEntries.length} {moodEntries.length===1?'registro':'registros'}</div>}
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'space-between'}}>
              {MOODS.map(m=>{
                const last=moodEntries.length>0?moodEntries[moodEntries.length-1]:null;
                const active=last?.mood===m.l;
                return(
                  <button key={m.l} className="tap" onClick={()=>{setMoodDraft(m);setMoodNote('');setShowMoodModal(true);haptic('light');}}
                    style={{flex:1,padding:'8px 4px',borderRadius:14,border:`2px solid ${active?m.color:C.border}`,
                      background:active?m.color+'18':'transparent',cursor:'pointer',fontFamily:F,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <span style={{fontSize:22}}>{m.e}</span>
                    <span style={{fontSize:8,color:active?m.color:C.textMuted,fontWeight:active?700:400}}>{m.l}</span>
                  </button>
                );
              })}
            </div>
            {moodEntries.length>0&&(
              <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:4}}>
                {moodEntries.slice(-2).reverse().map((entry,i)=>{
                  const mObj=MOODS.find(m=>m.l===entry.mood);
                  return(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:C.surfaceAlt,borderRadius:10}}>
                      <span style={{fontSize:16}}>{mObj?.e||'😐'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <span style={{fontSize:11,fontWeight:600,color:mObj?.color||C.text}}>{entry.mood}</span>
                        {entry.comida&&<span style={{fontSize:10,color:C.textMuted}}> · {entry.comida}</span>}
                        {entry.nota&&<div style={{fontSize:10,color:C.textSec,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.nota}</div>}
                      </div>
                      <span style={{fontSize:9,color:C.textMuted,flexShrink:0}}>{new Date(entry.ts).toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {log.length===0?(
            <div style={{textAlign:'center',padding:'40px 16px'}}>
              <div style={{fontSize:56,marginBottom:14}}>🍽️</div>
              <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6,letterSpacing:'-.3px'}}>Tu diario está vacío</div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,maxWidth:260,margin:'0 auto 20px'}}>
                Registra lo que comes y Calorú calcula tus macros automáticamente
              </div>
              <div style={{background:C.surface,borderRadius:20,padding:'16px',marginBottom:16,border:`1px solid ${C.border}`,textAlign:'left'}}>
                {[
                  {n:1,icon:'🔍',t:'Busca un alimento',s:'300+ productos chilenos'},
                  {n:2,icon:'📷',t:'Escanea el código de barra',s:'Cualquier producto empaquetado'},
                  {n:3,icon:'✨',t:'Créalo manualmente',s:'Alimento propio personalizado'},
                ].map(({n,icon,t,s})=>(
                  <div key={n} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:n<3?`1px solid ${C.border}`:'none'}}>
                    <div style={{width:32,height:32,borderRadius:10,background:`${C.primary}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{t}</div>
                      <div style={{fontSize:10,color:C.textMuted}}>{s}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="tap" onClick={()=>setTab(1)} style={{
                background:'#D42020',color:'white',border:'none',
                borderRadius:18,padding:'14px 32px',
                fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F,
                boxShadow:'0 8px 20px rgba(0,122,255,0.35)',
                width:'100%',
              }}>➕ Agregar primera comida</button>
            </div>
          ):<>
            {MEALS.map(m=>{
              const items=log.filter(r=>r.comida===m);
              if(!items.length) return null;
              const mc=items.reduce((s,r)=>{const rt=itemRatio(r);return {cal:s.cal+r.cal*rt*r.qty,prot:s.prot+r.prot*rt*r.qty,carbs:s.carbs+r.carbs*rt*r.qty,grasas:s.grasas+r.grasas*rt*r.qty};},{cal:0,prot:0,carbs:0,grasas:0});
              return (
                <div key={m} style={{marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${MC[m]},${MC[m]}BB)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:`0 3px 10px ${MC[m]}40`}}>{MI[m]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.text}}>{m}</div>
                      {sinCalorias?(
                        <div style={{display:'flex',gap:4,marginTop:3}}>
                          {[{icon:'💪',v:mc.prot,m:metas.prot},{icon:'⚡',v:mc.carbs,m:metas.carbs},{icon:'🥑',v:mc.grasas,m:metas.grasas}].map(({icon,v,m})=>(
                            <div key={icon} style={{fontSize:9,padding:'1px 5px',borderRadius:8,background:v/m>0.35?'#34C75918':'#F2F2F7',color:v/m>0.35?'#1a7a36':C.textSec}}>{icon}</div>
                          ))}
                        </div>
                      ):(
                        <div style={{fontSize:10,color:C.textSec,fontWeight:600,marginTop:1}}>{Math.round(mc.cal)} kcal · P:{Math.round(mc.prot)}g C:{Math.round(mc.carbs)}g G:{Math.round(mc.grasas)}g</div>
                      )}
                    </div>
                    {sinCalorias?(
                      <div style={{width:12,height:12,borderRadius:6,background:mc.cal/metas.cal>0.45?'#FF9500':mc.cal/metas.cal>0.2?'#34C759':'#C7C7CC',flexShrink:0}}/>
                    ):(
                      <span style={{fontSize:12,fontWeight:800,color:MC[m]}}>{Math.round(mc.cal)} kcal</span>
                    )}
                  </div>
                  {items.map(item=>(
                    <div key={item.uid} style={{background:C.surface,borderRadius:17,marginBottom:6,boxShadow:`0 2px 8px rgba(0,0,0,${dark?.1:.05})`,borderLeft:`3px solid ${MC[m]}`,overflow:'hidden'}}>
                      {/* Main row */}
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px'}}>
                        <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                        <div style={{flex:1,minWidth:0}} onClick={()=>setEditingItem(editingItem===item.uid?null:item.uid)}>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</div>
                          {(item.marca==='Nutri IA'||item.origen==='foto'||item.barcode)&&(
                            <div style={{display:'flex',gap:3,marginTop:2,flexWrap:'wrap'}}>
                              {item.marca==='Nutri IA'&&<span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:5,background:'#D4202018',color:'#A32D2D'}}>🤖 IA</span>}
                              {item.origen==='foto'&&<span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:5,background:'#5856D618',color:'#3a3895'}}>📸 Foto</span>}
                              {item.barcode&&<span style={{fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:5,background:'#34C75918',color:'#1a7a36'}}>📷 🇨🇱</span>}
                            </div>
                          )}
                          <div style={{display:'flex',gap:5,marginTop:3,flexWrap:'wrap'}}>
                            <span style={{fontSize:11,fontWeight:800,color:'#D42020'}}>{Math.round(item.cal*itemRatio(item)*item.qty)} kcal</span>
                            <span style={{fontSize:10,color:C.red,fontWeight:600}}>P:{Math.round(item.prot*itemRatio(item)*item.qty)}g</span>
                            <span style={{fontSize:10,color:C.amber,fontWeight:600}}>C:{Math.round(item.carbs*itemRatio(item)*item.qty)}g</span>
                            <span style={{fontSize:10,color:C.textMuted,fontWeight:500}}>{(item.grams||item.porcion||100)}g{getPortionHint(item.grams||item.porcion||100)?' · ≈'+getPortionHint(item.grams||item.porcion||100):''}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                          <button className="tap" onClick={()=>setEditingItem(editingItem===item.uid?null:item.uid)} style={{
                            width:28,height:28,borderRadius:8,border:`1px solid ${editingItem===item.uid?'#D42020':C.border}`,
                            background:editingItem===item.uid?'#D4202018':C.surfaceAlt,
                            fontSize:13,cursor:'pointer',color:editingItem===item.uid?'#D42020':C.textMuted,
                            display:'flex',alignItems:'center',justifyContent:'center',
                          }}>✏️</button>
                          <Stepper value={item.qty} onDec={()=>adj(item.uid,-1)} onInc={()=>adj(item.uid,1)}/>
                        </div>
                      </div>
                      {/* Inline editor */}
                      {editingItem===item.uid&&(
                        <div style={{padding:'10px 14px 14px',borderTop:`1px solid ${C.border}`,background:C.surfaceAlt,animation:'fadeUp .2s ease'}}>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                            <div>
                              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>Gramos</div>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <button onClick={()=>setItemGrams(item.uid,Math.max(1,(item.grams||item.porcion||100)-10))} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:14,cursor:'pointer',color:C.textSec,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                                <input type="number" value={item.grams||item.porcion||100}
                                  onChange={e=>setItemGrams(item.uid,+e.target.value||1)}
                                  style={{flex:1,padding:'6px 8px',border:`1.5px solid #D42020`,borderRadius:10,fontSize:14,fontWeight:700,color:C.text,background:C.surface,outline:'none',fontFamily:F,textAlign:'center'}}/>
                                <button onClick={()=>setItemGrams(item.uid,(item.grams||item.porcion||100)+10)} style={{width:28,height:28,borderRadius:8,border:'none',background:'#D42020',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>Cantidad</div>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <button onClick={()=>setItemQty(item.uid,item.qty-1)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:14,cursor:'pointer',color:C.textSec,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                                <input type="number" value={item.qty}
                                  onChange={e=>setItemQty(item.uid,+e.target.value||0)}
                                  style={{flex:1,padding:'6px 8px',border:`1.5px solid #D42020`,borderRadius:10,fontSize:14,fontWeight:700,color:C.text,background:C.surface,outline:'none',fontFamily:F,textAlign:'center'}}/>
                                <button onClick={()=>setItemQty(item.uid,item.qty+1)} style={{width:28,height:28,borderRadius:8,border:'none',background:'#D42020',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                            <span style={{fontSize:12,color:C.textSec,fontWeight:500}}>
                              Total: <strong style={{color:'#D42020'}}>{Math.round(item.cal*itemRatio({...item,grams:item.grams||item.porcion||100})*item.qty)} kcal</strong>
                            </span>
                            <button className="tap" onClick={()=>{setLog(log.filter(r=>r.uid!==item.uid));setEditingItem(null);haptic('delete');}} style={{padding:'6px 12px',borderRadius:10,border:'none',background:'#FF3B3018',color:'#FF3B30',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>🗑️ Eliminar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            <button className="tap" onClick={()=>{
  if(window.confirm('¿Reiniciar el día? Se borrarán las comidas de hoy. El historial se guardará.')){
    const tk=todayKey();
    LS.set('log_'+tk,[]); LS.set('ex_'+tk,[]);
    setLog([]); setExercises([]); setAgua(0);
    haptic('medium'); setToast('🗑️ Día reiniciado');
  }
}} style={{
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

          {/* ── SUB-TABS NAV ── */}
          <div style={{display:'flex',background:C.surfaceAlt,borderRadius:16,padding:4,marginBottom:14,gap:2}}>
            {['Mi perfil','Metas','Ajustes'].map((label,i)=>(
              <button key={i} className="tap" onClick={()=>setPerfilSubTab(i)} style={{
                flex:1,padding:'9px 4px',borderRadius:12,border:'none',
                background:perfilSubTab===i?C.surface:'transparent',
                color:perfilSubTab===i?C.text:C.textSec,
                fontSize:12,fontWeight:perfilSubTab===i?700:500,
                cursor:'pointer',fontFamily:F,
                boxShadow:perfilSubTab===i?'0 1px 4px rgba(0,0,0,0.12)':'none',
                transition:'all .15s',
              }}>{label}</button>
            ))}
          </div>

          {/* ════ SUB-TAB 0: MI PERFIL ════ */}
          {perfilSubTab===0&&(<>
          {/* Vestuario de NutriBot */}
          <button className="tap" onClick={()=>{setShowOutfitPicker(true);haptic('light');}} style={{
            width:'100%',textAlign:'left',background:C.surface,borderRadius:22,padding:'14px 16px',marginBottom:12,
            border:`1px solid ${C.border}`,cursor:'pointer',fontFamily:F,
            display:'flex',alignItems:'center',gap:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`,
          }}>
            <div style={{
              width:54,height:54,borderRadius:16,flexShrink:0,
              background:`linear-gradient(135deg,${C.primary}18,${C.surfaceAlt})`,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <NutriBot state="idle" size={46} outfit={nutribotOutfit}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,letterSpacing:'-.2px'}}>Vestuario de NutriBot 👕</div>
              <div style={{fontSize:12,color:C.textSec,marginTop:2}}>
                {botOutfitChoice==='auto'?'Automático — cambia según tu racha':`Atuendo: ${NUTRIBOT_OUTFITS.find(o=>o.id===botOutfitChoice)?.name||botOutfitChoice}`}
              </div>
            </div>
            <span style={{fontSize:18,color:C.textMuted}}>›</span>
          </button>
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            {/* Avatar + nombre */}
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
              <div style={{position:'relative'}}>
                {/* Foto o avatar emoji */}
                <div style={{
                  width:72,height:72,borderRadius:22,overflow:'hidden',
                  background:`linear-gradient(135deg,${C.surfaceAlt},${C.border})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:38,border:`2px solid ${C.border}`,flexShrink:0,
                }}>
                  {photoUrl
                    ? <img src={photoUrl} alt="foto" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : avatar
                  }
                </div>
                {/* Botón editar foto */}
                <label style={{
                  position:'absolute',bottom:-4,right:-4,
                  width:26,height:26,borderRadius:8,
                  background:'#D42020',border:'2px solid white',
                  fontSize:12,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',color:'white',
                  boxShadow:'0 2px 8px rgba(212,32,32,0.4)',
                }}>
                  {uploadingPhoto?'⏳':'📷'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={async(e)=>{
                    const file = e.target.files?.[0];
                    if(!file) return;
                    setUploadingPhoto(true);
                    // Read as base64 and store locally
                    // Show a local object URL for immediate display (never persisted)
                    const objectUrl = URL.createObjectURL(file);
                    setPhotoUrl(objectUrl);
                    if(supabaseUser) {
                      // Upload to Supabase and persist the public URL (not base64)
                      const fileName = `avatars/${supabaseUser.id}.jpg`;
                      supabase.storage.from('avatars').upload(fileName, file, {upsert:true})
                        .then(({data})=>{
                          if(data) {
                            const {data:pub} = supabase.storage.from('avatars').getPublicUrl(fileName);
                            if(pub?.publicUrl) {
                              setPhotoUrl(pub.publicUrl);
                              LS.set('photoUrl', pub.publicUrl);
                              supabase.from('profiles').upsert({id:supabaseUser.id, avatar_url:pub.publicUrl},{onConflict:'id'}).then(()=>{});
                            }
                          }
                        });
                    } else {
                      // Offline user — store in IndexedDB to avoid localStorage quota issues
                      PhotoDB.save('avatar', file).catch(()=>{});
                    }
                    setUploadingPhoto(false);
                    haptic('success');
                  }}/>
                </label>
                {/* Botón cambiar emoji avatar (si no hay foto) */}
                {!photoUrl&&<button className="tap" onClick={()=>setShowAvatarPicker(true)} style={{
                  position:'absolute',bottom:-4,left:-4,
                  width:26,height:26,borderRadius:8,
                  background:C.surfaceAlt,border:`2px solid ${C.border}`,
                  fontSize:12,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>😊</button>}
                {/* Botón borrar foto */}
                {photoUrl&&<button className="tap" onClick={()=>{setPhotoUrl('');LS.set('photoUrl','');haptic('light');}} style={{
                  position:'absolute',bottom:-4,left:-4,
                  width:26,height:26,borderRadius:8,
                  background:C.surfaceAlt,border:`2px solid ${C.border}`,
                  fontSize:11,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',color:C.textMuted,
                }}>✕</button>}
              </div>
              <div style={{flex:1}}>
                {editName?(
                  <div style={{display:'flex',gap:8}}>
                    <input value={tempName} onChange={e=>setTempName(e.target.value)}
                      autoFocus onFocus={e=>e.target.select()}
                      style={{flex:1,padding:'8px 12px',border:`1.5px solid #D42020`,borderRadius:12,fontSize:15,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F}}/>
                    <button className="tap" onClick={()=>{if(tempName.trim()){setNombre(tempName.trim());}setEditName(false);haptic('success');}} style={{padding:'8px 14px',borderRadius:12,border:'none',background:'#D42020',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>✓</button>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:'-.3px'}}>{nombre}</div>
                    <button className="tap" onClick={()=>{setTempName(nombre);setEditName(true);}} style={{background:'none',border:'none',fontSize:12,color:'#D42020',cursor:'pointer',fontFamily:F,fontWeight:600,padding:'2px 0',marginTop:2}}>✏️ Editar nombre</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Datos físicos</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
              {[{l:'Peso (kg)',k:'peso'},{l:'Altura (cm)',k:'altura'},{l:'Edad',k:'edad'}].map(({l,k})=>(
                <div key={k}>
                  <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:6,fontFamily:F}}>{l}</div>
                  <input type="number" value={perfil[k]} onChange={e=>setPerfil({...perfil,[k]:+e.target.value})}
                    style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:13,fontSize:16,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
                </div>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:7,fontFamily:F}}>Sexo</div>
              <div style={{display:'flex',gap:8}}>
                {[{v:'M',l:'♂ Hombre'},{v:'F',l:'♀ Mujer'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setPerfil({...perfil,sexo:v})} style={{flex:1,padding:'11px',borderRadius:13,border:'none',background:perfil.sexo===v?accent:C.surfaceAlt,color:perfil.sexo===v?'#FFFFFF':C.textSec,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>{l}</button>
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
            {/* 🏥 Condiciones de salud (selección múltiple) */}
            {(()=>{
              const conds = Array.isArray(perfil.condiciones)
                ? perfil.condiciones
                : (perfil.condicion&&perfil.condicion!=='ninguna' ? [perfil.condicion] : []);
              const setConds = (arr)=>{
                setPerfil({...perfil, condiciones:arr, condicion:arr[0]||'ninguna'});
              };
              const toggle = (v)=>{
                if(v==='ninguna'){ setConds([]); haptic('light'); return; }
                setConds(conds.includes(v) ? conds.filter(x=>x!==v) : [...conds,v]);
                haptic('light');
              };
              const DESC = {
                diabetes:'limitará azúcares y carbohidratos refinados',
                hipertension:'priorizará alimentos bajos en sodio y te alertará con comidas saladas',
                colesterol:'reducirá grasas saturadas y trans, priorizando grasas saludables',
                celiaco:'excluirá el gluten de todos los planes y recetas',
              };
              return (
              <div style={{marginTop:12}}>
                <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4,fontFamily:F}}>Condiciones de salud</div>
                <div style={{fontSize:11,color:C.textMuted,marginBottom:8,fontFamily:F}}>Puedes seleccionar más de una</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {[
                    {v:'ninguna',   l:'✅ Sin condición especial'},
                    {v:'diabetes',  l:'🩸 Diabetes tipo 2'},
                    {v:'hipertension', l:'💊 Hipertensión'},
                    {v:'colesterol',l:'🫀 Colesterol alto'},
                    {v:'celiaco',   l:'🌾 Enfermedad celíaca'},
                  ].map(({v,l})=>{
                    const sel = v==='ninguna' ? conds.length===0 : conds.includes(v);
                    return (
                      <button key={v} className="tap" onClick={()=>toggle(v)}
                        style={{padding:'11px 14px',borderRadius:13,textAlign:'left',display:'flex',alignItems:'center',gap:10,border:`1.5px solid ${sel?'#FF3B30':C.border}`,background:sel?'rgba(255,59,48,0.08)':C.surfaceAlt,color:sel?'#FF3B30':C.textSec,fontSize:12,fontWeight:sel?700:500,cursor:'pointer',fontFamily:F,transition:'all .15s'}}>
                        <span style={{
                          width:18,height:18,borderRadius:v==='ninguna'?9:6,flexShrink:0,
                          border:`2px solid ${sel?'#FF3B30':C.border}`,
                          background:sel?'#FF3B30':'transparent',
                          color:'#fff',fontSize:11,fontWeight:800,
                          display:'flex',alignItems:'center',justifyContent:'center',
                        }}>{sel?'✓':''}</span>
                        {l}
                      </button>
                    );
                  })}
                </div>
                {conds.length>0&&(
                  <div style={{marginTop:8,padding:'10px 12px',borderRadius:12,background:'rgba(255,59,48,0.06)',border:'1px solid rgba(255,59,48,0.15)'}}>
                    <div style={{fontSize:11,color:'#FF3B30',lineHeight:1.5}}>
                      La IA {conds.map(c=>DESC[c]).filter(Boolean).join('; ')}.
                    </div>
                  </div>
                )}
              </div>
              );
            })()}
            {/* ── Cuenta en la nube ── */}
            <div style={{marginTop:12,background:supabaseUser?'#34C75910':C.surfaceAlt,borderRadius:16,padding:'14px',border:`1px solid ${supabaseUser?'#34C75940':C.border}`}}>
              {supabaseUser?(
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:12,background:'#34C75920',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>☁️</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#34C759'}}>Datos sincronizados</div>
                    <div style={{fontSize:10,color:C.textMuted,marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{supabaseUser.email}</div>
                  </div>
                  <button className="tap" onClick={async()=>{
                    if(window.confirm('¿Cerrar sesión?')){
                      await supabase.auth.signOut();
                      setSupabaseUser(null);
                      haptic('medium');
                    }
                  }} style={{padding:'6px 12px',borderRadius:10,border:'1px solid #FF3B3040',background:'#FF3B3010',color:'#FF3B30',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F,flexShrink:0}}>
                    Salir
                  </button>
                </div>
              ):(
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:12,background:C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>👤</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text}}>Sin cuenta activa</div>
                    <div style={{fontSize:10,color:C.textMuted,marginTop:1}}>Tus datos solo existen en este celular</div>
                  </div>
                  <button className="tap" onClick={()=>window.location.reload()} style={{padding:'6px 12px',borderRadius:10,border:'none',background:'#D42020',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F,flexShrink:0}}>
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
          </>)}

          {/* ════ SUB-TAB 1: METAS ════ */}
          {perfilSubTab===1&&(<>
          <div style={{marginBottom:12,background:'linear-gradient(135deg,#FF9500,#FF6B00)',borderRadius:16,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 6px 18px rgba(255,149,0,0.35)'}}>
            <div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',fontWeight:700,textTransform:'uppercase'}}>Tu TDEE</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:500,marginTop:2}}>Calorías quemadas / día</div>
            </div>
            <div><span style={{fontSize:32,fontWeight:800,color:'white'}}>{tdee}</span><span style={{fontSize:13,color:'rgba(255,255,255,0.5)'}}> kcal</span></div>
          </div>
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>⚖️ Evolución de peso</div>
              <button className="tap" onClick={()=>{
                const w=parseFloat(perfil.peso);
                if(!w||isNaN(w)) return;
                const today=todayKey();
                const lbl=new Date().toLocaleDateString('es-CL',{day:'numeric',month:'short'});
                const idx=weightHistory.findIndex(e=>e.date===today);
                if(idx>=0) setWeightHistory(weightHistory.map((e,i)=>i===idx?{...e,w}:e));
                else setWeightHistory([...weightHistory,{date:today,w,label:lbl}].slice(-30));
                haptic('success'); setToast(`⚖️ ${w} kg registrado`);
              }} style={{padding:'6px 12px',borderRadius:12,border:'none',background:'#D42020',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                + Registrar hoy
              </button>
            </div>
            <WeightChart
              data={Array.from({length:30},(_,i)=>{
                const d=new Date(); d.setDate(d.getDate()-29+i);
                const key=dateToKey(d);
                const entry=weightHistory.find(e=>e.date===key);
                return {date:key,label:d.toLocaleDateString('es-CL',{day:'numeric',month:'short'}),w:entry?.w||null};
              })}
              C={C} F={F}
            />
          </div>
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:14}}>⚖️ Registro de peso</div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <input type="number" value={newWeight} onChange={e=>setNewWeight(e.target.value)} placeholder="Ej: 72.5"
                style={{flex:1,padding:'12px 14px',border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:16,fontFamily:F,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
              <button className="tap" onClick={addWeight} style={{padding:'12px 18px',borderRadius:14,border:'none',background:'#D42020',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,whiteSpace:'nowrap'}}>Registrar</button>
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
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Metas diarias</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {customMetas&&<span style={{fontSize:9,color:'#D42020',fontWeight:700,background:'#D4202014',padding:'2px 8px',borderRadius:8}}>Personalizadas</span>}
                  {customMetas&&<button className="tap" onClick={()=>{setCustomMetas(null);haptic('light');}} style={{fontSize:10,color:'#FF3B30',background:'none',border:'none',cursor:'pointer',fontFamily:F,fontWeight:600}}>Auto</button>}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {[{l:'Calorías',k:'cal',u:'kcal',col:'#1C1C1E'},{l:'Proteínas',k:'prot',u:'g',col:C.red},{l:'Carbos',k:'carbs',u:'g',col:C.amber},{l:'Grasas',k:'grasas',u:'g',col:C.purple}].map(({l,k,u,col})=>(
                  <div key={k} style={{background:col,borderRadius:14,padding:'10px 6px',textAlign:'center'}}>
                    <input type="number"
                      value={metas[k]}
                      onChange={e=>setCustomMetas({...metas,[k]:Math.max(0,+e.target.value||0)})}
                      style={{width:'100%',background:'none',border:'none',color:'white',fontSize:16,fontWeight:800,lineHeight:1,textAlign:'center',outline:'none',fontFamily:F,padding:0}}
                    />
                    <div style={{color:'rgba(255,255,255,0.45)',fontSize:8,margin:'2px 0'}}>{u}</div>
                    <div style={{color:'rgba(255,255,255,0.6)',fontSize:8,fontWeight:700}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:8,textAlign:'center'}}>Toca cualquier número para editar tu meta</div>
            </div>
            {(obj==='bajar'||obj==='subir')&&(
              <div style={{marginTop:16,marginBottom:4}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🎯 Ritmo de progreso</div>
                <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>
                  ¿Qué tan rápido quieres alcanzar tu meta? Esto ajusta tus calorías diarias automáticamente.
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {Object.entries(RITMOS).map(([k,r])=>(
                    <button key={k} onClick={()=>setRitmo(k)} style={{
                      padding:'12px 10px',borderRadius:16,
                      border:`2px solid ${ritmo===k?r.color:C.border}`,
                      background:ritmo===k?r.color+'18':C.surface,
                      color:ritmo===k?r.color:C.text,
                      fontFamily:F,cursor:'pointer',fontWeight:700,fontSize:12,
                      textAlign:'left',
                    }}>
                      <div style={{fontSize:16,marginBottom:4}}>{r.label.split(' ')[0]}</div>
                      <div style={{fontWeight:800}}>{r.label.split(' ').slice(1).join(' ')}</div>
                      <div style={{fontSize:10,opacity:0.7,marginTop:2,fontWeight:500}}>{r.desc}</div>
                    </button>
                  ))}
                </div>
                <div style={{marginTop:10,padding:'10px 14px',background:C.surfaceAlt,borderRadius:12,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.textSec}}>
                    Con ritmo <strong style={{color:RITMOS[ritmo]?.color}}>{RITMOS[ritmo]?.label}</strong>: tu meta calórica es <strong style={{color:C.text}}>{metas.cal} kcal/día</strong>
                  </div>
                </div>
              </div>
            )}
            {isPro&&(
              <div style={{marginTop:16,marginBottom:4}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🌙 Modo fin de semana</div>
                <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>
                  Los sábados y domingos tus metas calóricas se relajan automáticamente al ritmo "Tranquilo". Para que puedas disfrutar sin culpa.
                </div>
                <div onClick={()=>{haptic('light');setModoFinde(v=>!v);}} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'12px 16px',borderRadius:16,border:`1.5px solid ${modoFinde?'#5856D6':C.border}`,
                  background:modoFinde?'rgba(88,86,214,0.08)':C.surface,cursor:'pointer',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:22}}>🌙</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.text}}>Relajar metas en finde</div>
                      <div style={{fontSize:11,color:C.textSec}}>{esFinde?'Hoy aplica ✅':'Aplica sáb y dom'}</div>
                    </div>
                  </div>
                  <div style={{width:48,height:28,borderRadius:14,background:modoFinde?'#5856D6':'#D4202030',position:'relative',transition:'background .2s'}}>
                    <div style={{position:'absolute',top:3,left:modoFinde?22:4,width:22,height:22,borderRadius:11,background:'white',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          </>)}

          {/* ════ SUB-TAB 2: AJUSTES ════ */}
          {perfilSubTab===2&&(<>
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🌱 Modo vegano</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>Filtra los productos no-veganos en el buscador y muestra el estado vegano de cada alimento.</div>
              <div style={{background:veganMode?'#34C75910':'#F2F2F7',borderRadius:18,padding:'14px 16px',border:`1.5px solid ${veganMode?'#34C75940':C.border}`,display:'flex',alignItems:'center',gap:14,transition:'all .25s ease'}}>
                <div style={{width:46,height:46,borderRadius:14,background:veganMode?'#34C75918':C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,transition:'background .2s'}}>🌱</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.2}}>{veganMode?'Modo vegano activo':'Modo vegano desactivado'}</div>
                  <div style={{fontSize:11,color:C.textSec,marginTop:2,lineHeight:1.4}}>{veganMode?'Solo ves productos 100% veganos en el buscador':'Activar para filtrar productos con origen animal'}</div>
                </div>
                <button className="tap" onClick={()=>{haptic('light');setVeganMode(v=>!v);}} style={{flexShrink:0,width:51,height:31,borderRadius:16,border:'none',cursor:'pointer',background:veganMode?'#34C759':'#C7C7CC',position:'relative',transition:'background .25s ease',padding:0}} aria-label="Activar modo vegano">
                  <div style={{position:'absolute',top:3,left:veganMode?23:3,width:25,height:25,borderRadius:13,background:'white',boxShadow:'0 2px 6px rgba(0,0,0,0.20)',transition:'left .22s cubic-bezier(.34,1.56,.64,1)'}}/>
                </button>
              </div>
              {veganMode&&<div style={{marginTop:8,padding:'8px 12px',background:'#34C75910',borderRadius:12,border:'1px solid #34C75930',fontSize:11,color:'#34C759',fontWeight:600}}>🌱 Filtrando productos no-veganos del buscador</div>}
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${sinCalorias?'#34C759':C.border}`,display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontSize:28,flexShrink:0}}>🎯</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.2}}>{sinCalorias?'Modo sin calorías activo':'Modo sin calorías'}</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:2}}>Semáforos y frases en vez de números</div>
              </div>
              <button className="tap" onClick={()=>{haptic('light');setSinCalorias(v=>!v);}} style={{width:44,height:26,borderRadius:13,border:'none',cursor:'pointer',padding:0,background:sinCalorias?'#34C759':C.border,position:'relative',transition:'background .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:3,left:sinCalorias?20:3,width:20,height:20,borderRadius:10,background:'white',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
              </button>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🚫 Alergias e intolerancias</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>Los alimentos marcados se ocultarán automáticamente del buscador.</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {ALLERGENS.map(al=>{
                  const active=userAllergens.includes(al.k);
                  return(
                    <button key={al.k} className="tap" onClick={()=>{haptic('light');setUserAllergens(prev=>active?prev.filter(x=>x!==al.k):[...prev,al.k]);}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:20,cursor:'pointer',fontFamily:F,border:`1.5px solid ${active?al.color:C.border}`,background:active?al.color+'18':C.surfaceAlt,transition:'all .18s ease'}}>
                      <span style={{fontSize:16}}>{al.icon}</span>
                      <div style={{textAlign:'left'}}>
                        <div style={{fontSize:12,fontWeight:active?700:500,color:active?al.color:C.text,lineHeight:1}}>{al.label}</div>
                        <div style={{fontSize:9,color:C.textMuted,marginTop:1}}>{al.desc}</div>
                      </div>
                      {active&&<span style={{fontSize:10,color:al.color,fontWeight:800,marginLeft:2}}>✓</span>}
                    </button>
                  );
                })}
              </div>
              {userAllergens.length>0&&<div style={{marginTop:10,padding:'8px 12px',background:'#FF3B3010',borderRadius:12,border:'1px solid #FF3B3030',fontSize:11,color:'#FF3B30',fontWeight:600,lineHeight:1.5}}>⚠️ Ocultando productos con: {userAllergens.map(k=>ALLERGENS.find(a=>a.k===k)?.label).filter(Boolean).join(', ')}</div>}
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${accountType==='professional'?'#1D3557':C.border}`}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{accountType==='professional'?'👩‍⚕️ Cuenta profesional':'👤 Cuenta personal'}</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:10}}>{accountType==='professional'?'Panel de nutricionista activo':'Cambia a profesional si eres nutricionista o coach'}</div>
              <div style={{display:'flex',gap:8}}>
                {[{k:'personal',l:'👤 Personal'},{k:'professional',l:'👩‍⚕️ Profesional'}].map(({k,l})=>(
                  <button key={k} onClick={async()=>{
                    if(k==='professional' && supabaseUser && subscriptionStatus && subscriptionStatus!=='nutricionista'){
                      setToast('Necesitas el Plan Nutricionista ($9.990/mes) — te llevamos a pagar 👩‍⚕️');
                      try{
                        const session=await supabase.auth.getSession();
                        const token=session.data.session?.access_token;
                        const res=await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/create-subscription',{
                          method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                          body:JSON.stringify({plan:'nutricionista',back_url:'https://caloru.cl'}),
                        });
                        const data=await res.json();
                        if(data.init_point) window.location.href=data.init_point;
                        else setToast('Error al crear la suscripción. Intenta de nuevo.');
                      }catch{setToast('Error de conexión. Intenta de nuevo.');}
                      return;
                    }
                    setAccountType(k);LS.set('accountType',k);
                    if(supabaseUser) supabase.from('profiles').upsert({id:supabaseUser.id,account_type:k},{onConflict:'id'}).then(()=>{});
                    haptic('light');
                  }} style={{flex:1,padding:'9px',borderRadius:12,border:`1.5px solid ${accountType===k?'#1D3557':C.border}`,background:accountType===k?'#1D355715':'transparent',color:accountType===k?'#1D3557':C.textSec,fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:18,padding:'14px 16px',marginBottom:12,border:`1px solid ${nutriPlan?'#1D3557':C.border}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:nutriPlan?10:0}}>
                <div style={{fontSize:28,flexShrink:0}}>👩‍⚕️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.2}}>{nutriPlan?`Vinculado con ${nutriPlan.nutricionista_nombre||'tu nutricionista'}`:'Vincular con nutricionista'}</div>
                  <div style={{fontSize:11,color:nutriPlan?'#34C759':C.textSec,marginTop:2,fontWeight:nutriPlan?700:400}}>{nutriPlan?'⭐ Pro activado por tu nutricionista':!supabaseUser?'Necesitas una cuenta para vincularte':'Ingresa el código que te dio tu nutricionista'}</div>
                </div>
                {nutriPlan&&<button onClick={async()=>{
                  setNutriPlan(null); LS.set('nutriPlan',null); setProSource('');
                  if(supabaseUser) await supabase.from('profiles').update({linked_nutricionista_id:null,linked_nutricionista_nombre:null}).eq('id',supabaseUser.id);
                  supabase.from('profiles').select('subscription_status,subscription_expires_at').eq('id',supabaseUser.id).single().then(({data})=>{
                    if(data) setIsPro((data.subscription_status==='pro'||data.subscription_status==='nutricionista')&&(!data.subscription_expires_at||new Date(data.subscription_expires_at)>new Date()));
                    else setIsPro(false);
                  });
                }} style={{background:'none',border:'none',color:C.textMuted,fontSize:12,cursor:'pointer',fontFamily:F}}>✕</button>}
              </div>
              {!nutriPlan&&(
                <div style={{display:'flex',gap:8,marginTop:10}}>
                  <input value={nutriCode} onChange={e=>setNutriCode(e.target.value.toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1'))} placeholder="NUT-XXXXX" style={{flex:1,padding:'10px 12px',borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:14,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F,letterSpacing:2}}/>
                  <button onClick={async()=>{
                    if(loadingNutriCode) return;
                    // Para vincularse, el paciente DEBE tener cuenta (la búsqueda del
                    // código y el guardado requieren sesión). Si es invitado, avisar.
                    if(!supabaseUser){
                      haptic('error');
                      setToast('Primero crea tu cuenta o inicia sesión para vincularte con tu nutricionista 👩‍⚕️');
                      onRequestAuth && onRequestAuth();
                      return;
                    }
                    if(!nutriCode.trim()){ haptic('error'); setToast('Ingresa el código que te dio tu nutricionista (NUT-XXXXX).'); return; }
                    setLoadingNutriCode(true);
                    try {
                      // Normalizar caracteres ambiguos (O→0, I/L→1) por si los confundieron al copiar
                      const codeNorm = nutriCode.trim().toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1');
                      const {data:nutrData, error:codeErr} = await supabase.from('nutricionista_codes').select('nutricionista_id,nombre').eq('code',codeNorm).maybeSingle();
                      if(codeErr){ haptic('error'); setToast('Error de conexión. Revisa tu internet e intenta de nuevo.'); setLoadingNutriCode(false); return; }
                      if(nutrData) {
                        // 1. Vincular en profiles
                        await supabase.from('profiles').update({
                          linked_nutricionista_id: nutrData.nutricionista_id,
                          linked_nutricionista_nombre: nutrData.nombre,
                        }).eq('id', supabaseUser.id);
                        // 2. Buscar plan del nutricionista asignado a este paciente (por email)
                        let planRow = null;
                        if(supabaseUser.email) {
                          const {data:found} = await supabase.from('nutrition_plans')
                            .select('*')
                            .eq('nutricionista_id', nutrData.nutricionista_id)
                            .eq('paciente_email', supabaseUser.email.toLowerCase())
                            .limit(1)
                            .maybeSingle();
                          if(found) {
                            planRow = found;
                            // 3. Asignar paciente_id y registrar actividad
                            await supabase.from('nutrition_plans').update({
                              paciente_id: supabaseUser.id,
                              ultima_actividad: new Date().toISOString(),
                            }).eq('id', found.id);
                          }
                        }
                        // 4. Guardar nutriPlan con datos completos del plan (si existe)
                        const plan = {
                          nutricionista_nombre: nutrData.nombre,
                          calorias_meta: planRow?.calorias_meta || null,
                          mensaje: planRow?.mensaje || null,
                          recomendaciones: planRow?.recomendaciones || [],
                        };
                        setNutriPlan(plan); LS.set('nutriPlan', plan);
                        setIsPro(true);
                        setProSource('nutricionista:'+nutrData.nombre);
                        haptic('success');
                        setToast(planRow
                          ? '✅ Vinculado con '+nutrData.nombre+'. ¡Pro activado!'
                          : '✅ Vinculado con '+nutrData.nombre+'. ¡Pro activado! (aún sin pauta asignada a tu email)');
                      } else { haptic('error'); setToast('Código no encontrado. Verifica que esté bien escrito (NUT-XXXXX).'); }
                    } catch(err){
                      haptic('error'); setToast('No se pudo vincular. Revisa tu conexión e intenta de nuevo.');
                    } finally {
                      setLoadingNutriCode(false);
                    }
                  }} disabled={loadingNutriCode} style={{padding:'10px 14px',borderRadius:12,border:'none',background:'#1D3557',color:'white',fontFamily:F,cursor:'pointer',fontSize:12,fontWeight:700,flexShrink:0}}>
                    {loadingNutriCode?'...':'Vincular'}
                  </button>
                </div>
              )}
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:22}}>{autoTheme?'🌓':dark?'🌙':'☀️'}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Tema {autoTheme?'automático':dark?'oscuro':'claro'}</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>{autoTheme?'Oscuro 20:00–07:00 · Claro resto del día':'Toca para cambiar'}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button className="tap" onClick={()=>{setAutoTheme(!autoTheme);haptic('light');}} style={{padding:'5px 10px',borderRadius:10,border:`1px solid ${autoTheme?'#D42020':C.border}`,background:autoTheme?'#D4202018':C.surfaceAlt,color:autoTheme?'#D42020':C.textSec,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:F}}>Auto</button>
                {!autoTheme&&<button className="tap" onClick={()=>{setDark(!dark);LS.set('darkMode',!dark);haptic('light');}} style={{padding:'5px 10px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:14,cursor:'pointer',fontFamily:F}}>{dark?'☀️':'🌙'}</button>}
              </div>
            </div>
            <div style={{background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:22}}>🔔</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recordatorios</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>Aviso para registrar comidas</div>
              </div>
              <button className="tap" onClick={()=>{setNotifEnabled(!notifEnabled);haptic('medium');}} style={{width:50,height:28,borderRadius:14,border:'none',cursor:'pointer',background:notifEnabled?'#34C759':'rgba(120,120,128,0.2)',position:'relative',transition:'background .25s'}}>
                <div style={{position:'absolute',top:3,left:notifEnabled?24:3,width:22,height:22,borderRadius:11,background:'white',boxShadow:'0 2px 6px rgba(0,0,0,0.25)',transition:'left .25s cubic-bezier(.34,1.56,.64,1)'}}/>
              </button>
            </div>
            <button className="tap" onClick={()=>{if(window.confirm('¿Reiniciar toda la configuración? Se borrarán todos tus datos.')){localStorage.clear();window.location.reload();}}} style={{width:'100%',padding:'12px',borderRadius:14,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textMuted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>
              🔄 Reiniciar configuración
            </button>
          </div>
          <div style={{display:'flex',gap:14,justifyContent:'center',padding:'8px 0 4px'}}>
            <button onClick={()=>setShowLegal('privacy')} style={{background:'none',border:'none',fontSize:11,color:C.textMuted,cursor:'pointer',fontFamily:F}}>Política de privacidad</button>
            <span style={{color:C.textMuted,fontSize:11}}>·</span>
            <button onClick={()=>setShowLegal('terms')} style={{background:'none',border:'none',fontSize:11,color:C.textMuted,cursor:'pointer',fontFamily:F}}>Términos de servicio</button>
          </div>
          {supabaseUser&&(
            <div style={{marginTop:16,padding:'0 16px'}}>
              <button className="tap" onClick={async()=>{
                const confirm1=window.prompt('Para eliminar tu cuenta y TODOS tus datos permanentemente, escribe ELIMINAR:');
                if(confirm1!=='ELIMINAR') return;
                try{
                  setToast('Eliminando cuenta...');
                  const session=await supabase.auth.getSession();
                  const token=session?.data?.session?.access_token;
                  if(!token){setToast('❌ No hay sesión activa');return;}
                  const res=await fetch('https://fywghvfdwltayylswnid.supabase.co/functions/v1/delete-account',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}});
                  const data=await res.json();
                  if(data.success){localStorage.clear();setToast('✓ Cuenta eliminada. Adiós 👋');setTimeout(()=>window.location.reload(),2000);}
                  else{setToast('❌ '+(data.error||'Error al eliminar'));}
                }catch(e){setToast('❌ Error de conexión');}
              }} style={{width:'100%',padding:'13px',borderRadius:14,border:'1px solid #FF3B3030',background:'#FF3B3008',color:'#FF3B30',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>
                🗑️ Eliminar mi cuenta permanentemente
              </button>
            </div>
          )}
          </>)}

        </div>}
      </div>

        {/* ══════════════════════════════════
            TAB 4 — ESTADÍSTICAS
        ══════════════════════════════════ */}
        {tab===3&&<div className={tabAnim}>
          {/* Estado vacío */}
          {weekData.filter(d=>d.cal>0).length===0?(
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:56,marginBottom:14}}>📊</div>
              <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>Aún sin estadísticas</div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,maxWidth:260,margin:'0 auto 24px'}}>
                Registra comidas durante al menos un día y aquí verás tus tendencias
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="tap" onClick={()=>setTab(1)} style={{padding:'12px 22px',borderRadius:16,border:'none',background:'#D42020',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,boxShadow:'0 6px 16px rgba(212,32,32,0.3)'}}>➕ Registrar hoy</button>
                <button className="tap" onClick={()=>setTab(4)} style={{padding:'12px 22px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surface,color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>⚙️ Ver perfil</button>
              </div>
            </div>
          ):(
          <>

          {/* ── SECCIÓN 1: Resumen de hoy ── */}
          <div style={{fontSize:11,fontWeight:600,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,padding:'0 4px',marginBottom:8}}>Resumen de hoy</div>
          <div style={{background:C.surface,borderRadius:22,padding:'16px',marginBottom:14,border:`1px solid ${C.border}`,boxShadow:dark?'none':'0 2px 12px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <DonutChart prot={tot.prot} carbs={tot.carbs} grasas={tot.grasas} total={tot.cal} size={120} C2={{
                border:dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)',
                textMuted:dark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.35)',
                text:dark?'#FFFFFF':'#000000',
                red:C.red, amber:C.amber, purple:C.purple,
              }}/>
              <div style={{flex:1}}>
                {[
                  {l:'Proteínas',     v:Math.round(tot.prot),   m:metas.prot,  c:C.red},
                  {l:'Carbohidratos', v:Math.round(tot.carbs),  m:metas.carbs, c:C.amber},
                  {l:'Grasas',        v:Math.round(tot.grasas), m:metas.grasas,c:C.purple},
                  {l:'Fibra',         v:Math.round(tot.fibra),  m:25,          c:C.green},
                ].map(({l,v,m,c})=>(
                  <div key={l} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
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

          {/* ── SECCIÓN 2: Esta semana ── */}
          <div style={{fontSize:11,fontWeight:600,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,padding:'0 4px',marginBottom:8}}>Esta semana</div>
          <div style={{background:C.surface,borderRadius:22,padding:'16px',marginBottom:14,border:`1px solid ${C.border}`}}>
            <WeekChart data={weekData} meta={metas.cal} C={C} F={F}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:6,marginTop:12}}>
              {[
                {l:'Días',    v:`${weekData.filter(d=>d.cal>0).length}/7`,          c:'#D42020'},
                {l:'En meta', v:`${weekData.filter(d=>d.cal>0&&d.cal<=metas.cal).length}`,c:'#34C759'},
                {l:'Racha',   v:`🔥${streak.days}`,                                  c:'#FF9500'},
                {l:'Prom',    v:`${weekData.filter(d=>d.cal>0).length>0?Math.round(weekData.filter(d=>d.cal>0).reduce((s,d)=>s+d.cal,0)/weekData.filter(d=>d.cal>0).length):0}`,c:'#AF52DE'},
              ].map(({l,v,c})=>(
                <div key={l} style={{background:C.surfaceAlt,borderRadius:12,padding:'10px 8px',textAlign:'center',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:15,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
                  <div style={{fontSize:9,color:C.textSec,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECCIÓN 3: Acceso rápido (Free) ── */}
          <div style={{fontSize:11,fontWeight:600,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,padding:'0 4px',marginBottom:8}}>Acceso rápido</div>
          <div style={{background:C.surface,borderRadius:22,padding:'12px',marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[
                {icon:'📅',l:'Historial',    fn:()=>setShowHistory(true),         col:'#D42020'},
                {icon:'📊',l:'Semana',       fn:()=>setShowWeekly(true),          col:'#34C759'},
                {icon:'📤',l:'Compartir',    fn:()=>setShowShare(true),           col:'#AF52DE'},
                {icon:'🔔',l:'Recordatorios',fn:()=>setShowRecordatorios(true),   col:'#FF9500'},
                {icon:'🌡️',l:'¿Qué como?',  fn:()=>setShowQueComer(true),        col:'#007AFF'},
                {icon:'🏅',l:'Desafíos',     fn:()=>setShowDesafiosComunidad(true),col:'#FFD700'},
              ].map(({icon,l,fn,col})=>(
                <button key={l} className="tap" onClick={fn} style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:14,padding:'10px 6px',display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',fontFamily:F}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${col}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
                  <span style={{fontSize:10,fontWeight:600,color:C.text,textAlign:'center',lineHeight:1.2}}>{l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── SECCIÓN 4: Herramientas Pro ── */}
          <button className="tap" onClick={()=>setShowHerramientasPro(true)} style={{
            width:'100%',padding:'14px 16px',borderRadius:18,marginBottom:14,
            background:C.surface,border:`1px solid ${C.border}`,
            display:'flex',alignItems:'center',justifyContent:'space-between',
            cursor:'pointer',fontFamily:F,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:12,background:'#5856D614',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>⚙️</div>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Herramientas Pro</div>
                <div style={{fontSize:11,color:C.textSec}}>12 herramientas disponibles</div>
              </div>
            </div>
            <span style={{fontSize:18,color:C.textMuted}}>›</span>
          </button>

          {/* Modal Herramientas Pro */}
          {showHerramientasPro&&(
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowHerramientasPro(false)}>
              <div style={{background:C.surface,borderRadius:'24px 24px 0 0',padding:'16px 16px 40px',width:'100%',height:'72vh',display:'flex',flexDirection:'column',boxSizing:'border-box'}} onClick={e=>e.stopPropagation()}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexShrink:0}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>⚙️ Herramientas Pro</div>
                  <button onClick={()=>setShowHerramientasPro(false)} style={{background:'none',border:'none',fontSize:22,color:C.textMuted,cursor:'pointer',padding:4,fontFamily:F}}>✕</button>
                </div>
                <div style={{overflowY:'auto',flex:1}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {icon:'🇨🇱',l:'Recetas IA',      sub:'Cocina chilena',       fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowRecetasIA(true);},       col:'#D42020'},
                    {icon:'🛒',l:'Lista Compras',    sub:'Inteligente IA',       fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowListaComprasIA(true);},   col:'#34C759'},
                    {icon:'📅',l:'Plan Semanal',     sub:'Menú 7 días IA',       fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowPlanSemanal(true);},      col:'#5856D6'},
                    {icon:'📉',l:'Predicción Peso',  sub:'Ver mi progreso',      fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowPredicionPeso(true);},    col:'#D42020'},
                    {icon:'🧬',l:'Plan Adaptativo',  sub:'Ajuste semanal IA',    fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowPlanAdaptativo(true);},   col:'#5856D6'},
                    {icon:'👨‍👩‍👧',l:'Plan Familiar',   sub:'Hasta 5 miembros',    fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowPlanFamiliar(true);},     col:'#FF9500'},
                    {icon:'🏥',l:'Salud Especial',   sub:'Diabetes / Hipert.',   fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowModoSalud(true);},        col:'#5856D6'},
                    {icon:'📄',l:'Planes PDF',       sub:'Descarga tu plan',     fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowPlanesDescargables(true);},col:'#D42020'},
                    {icon:'📊',l:'Exportar CSV',     sub:'Últimos 30 días',      fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}exportCSV();},                   col:'#34C759'},
                    {icon:'👥',l:'Liga Amigos',      sub:'Ranking semanal',      fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowLigaAmigos(true);},       col:'#AF52DE'},
                    {icon:'🍂',l:'Recetas Temp.',    sub:'Ingredientes oferta',  fn:()=>{setShowHerramientasPro(false);if(!isPro){setShowPaywall(true);return;}setShowRecetasTemporada(true);}, col:'#34C759'},
                    {icon:'🏆',l:'Reto 21 días',     sub:'Nuevo hábito',         fn:()=>{setShowHerramientasPro(false);setShowChallenge(true);},                                                col:'#FF9500', free:true},
                  ].map(({icon,l,sub,fn,col,free})=>(
                    <button key={l} className="tap" onClick={fn} style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:18,padding:'14px 12px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:5,cursor:'pointer',fontFamily:F,textAlign:'left'}}>
                      <div style={{display:'flex',justifyContent:'space-between',width:'100%',alignItems:'center'}}>
                        <div style={{width:42,height:42,borderRadius:12,background:`${col}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{icon}</div>
                        {!free&&<span style={{fontSize:9,fontWeight:700,background:'#FFD700',color:'#5a3e00',padding:'2px 7px',borderRadius:6}}>PRO</span>}
                      </div>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.2}}>{l}</div>
                      <div style={{fontSize:10,color:C.textSec}}>{sub}</div>
                    </button>
                  ))}
                </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Logros ── */}
          {(()=>{
            const allLogros=[
              {icon:'🌱',l:'Primer registro',  desc:'Registra tu primera comida',  done:log.length>0},
              {icon:'💧',l:'Bien hidratado',    desc:`Completa ${waterGoal} vasos de agua`,    done:agua>=waterGoal},
              {icon:'🔥',l:'3 días seguidos',   desc:'Mantén racha de 3+ días',     done:streak.days>=3},
              {icon:'🏆',l:'7 días seguidos',   desc:'Una semana completa',         done:streak.days>=7},
              {icon:'✅',l:'Día completo',      desc:'Registra las 5 comidas',      done:log.length>=5},
              {icon:'💪',l:'Primer ejercicio',  desc:'Registra un ejercicio',       done:exercises.length>0},
              {icon:'🎯',l:'En tu meta',        desc:'Cumple tu meta calórica',     done:pct>=0.95&&pct<=1.1},
              {icon:'⭐',l:'Primer favorito',   desc:'Guarda un alimento favorito', done:favorites.length>0},
              {icon:'✨',l:'Chef personal',     desc:'Crea un alimento',            done:customFoods.length>0},
              {icon:'📝',l:'Diario activo',     desc:'Escribe una nota del día',    done:dayNote.length>0},
              {icon:'📅',l:'Racha 14 días',     desc:'14 días consecutivos',        done:streak.days>=14},
              {icon:'🌟',l:'Racha 21 días',     desc:'21 días — ¡hábito formado!',  done:streak.days>=21},
            ];
            const completed = allLogros.filter(a=>a.done);
            const pending   = allLogros.filter(a=>!a.done);
            const visible   = showAllLogros ? allLogros : [...completed, ...pending.slice(0,Math.max(0,4-completed.length))];
            return(
              <div style={{background:C.surface,borderRadius:22,padding:'16px',marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>🏆 Logros</div>
                  <div style={{fontSize:11,color:'#34C759',fontWeight:700}}>{completed.length}/{allLogros.length} completados</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {visible.map(({icon,l,desc,done})=>(
                    <div key={l} style={{padding:'12px',borderRadius:16,background:done?'#34C75910':C.surfaceAlt,border:`1px solid ${done?'#34C75940':C.border}`,opacity:done?1:0.6}}>
                      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:done?C.text:C.textSec,lineHeight:1.2}}>{l}</div>
                      {done&&<div style={{fontSize:10,color:'#34C759',fontWeight:700,marginTop:4}}>✓ Completado</div>}
                      {!done&&<div style={{fontSize:10,color:C.textMuted,marginTop:2,lineHeight:1.3}}>{desc}</div>}
                    </div>
                  ))}
                </div>
                {(allLogros.length > visible.length || showAllLogros)?(
                  <button className="tap" onClick={()=>setShowAllLogros(v=>!v)} style={{width:'100%',padding:'9px',borderRadius:12,marginTop:10,border:`1px solid ${C.border}`,background:'none',color:accent,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                    {showAllLogros?'▲ Ver menos':'▼ Ver todos los logros ('+allLogros.length+')'}
                  </button>
                ):null}
              </div>
            );
          })()}

          {/* ── Mis alimentos guardados ── */}
          {customFoods.length>0&&(()=>{
            const scanned=customFoods.filter(f=>f.origen==='escaneado'||f.cat==='Escaneado'||f.barcode);
            const created=customFoods.filter(f=>f.origen!=='escaneado'&&f.cat!=='Escaneado'&&!f.barcode);
            const Row=({f})=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${C.border}`,cursor:'pointer'}} onClick={()=>setDetail(f)}>
                <span style={{fontSize:22,flexShrink:0}}>{f.emoji||'📦'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec,display:'flex',gap:8,alignItems:'center',marginTop:1}}>
                    <span>{f.cal} kcal · {f.porcion}g</span>
                    {(f.origen==='escaneado'||f.barcode)&&<span style={{fontSize:9,fontWeight:700,color:'#34C759',background:'#34C75918',padding:'1px 6px',borderRadius:6}}>📷 escaneado</span>}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setCustomFoods(customFoods.filter(x=>x.id!==f.id));haptic('light');}} style={{background:'none',border:'none',color:C.textMuted,fontSize:16,cursor:'pointer',padding:4,flexShrink:0}}>✕</button>
              </div>
            );
            return(
              <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,border:`1px solid ${C.border}`}}>
                {scanned.length>0&&(
                  <div style={{marginBottom:created.length?16:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                      <span>📷</span> Escaneados por ti
                      <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>({scanned.length})</span>
                    </div>
                    {scanned.map(f=><Row key={f.id} f={f}/>)}
                  </div>
                )}
                {created.length>0&&(
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,marginTop:scanned.length?8:0,display:'flex',alignItems:'center',gap:6}}>
                      <span>✨</span> Creados por ti
                      <span style={{fontSize:11,color:C.textMuted,fontWeight:400}}>({created.length})</span>
                    </div>
                    {created.map(f=><Row key={f.id} f={f}/>)}
                  </div>
                )}
              </div>
            );
          })()}

          </>
          )}
        </div>}

      {/* ══ LOGRO DESBLOQUEADO ══ */}
      {showLogroUnlock&&<LogroUnlockModal C={C} F={F} logro={showLogroUnlock} onClose={()=>setShowLogroUnlock(null)}/>}

      {/* ══ MOOD MODAL ══ */}
      {showMoodModal&&moodDraft&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:60,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowMoodModal(false)}>
          <div style={{background:C.surface,borderRadius:'24px 24px 0 0',padding:'20px 20px 36px',width:'100%',boxSizing:'border-box'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:17,fontWeight:800,color:C.text}}>{moodDraft.e} {moodDraft.l}</div>
              <button onClick={()=>setShowMoodModal(false)} style={{background:'none',border:'none',fontSize:22,color:C.textMuted,cursor:'pointer',padding:4,fontFamily:F}}>✕</button>
            </div>
            <div style={{fontSize:12,color:C.textSec,marginBottom:10}}>¿Con qué comida lo relacionas?</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              {['—',...MEALS].map(m=>{
                const active=moodDraft._comida===m;
                return(
                  <button key={m} className="tap" onClick={()=>setMoodDraft({...moodDraft,_comida:m})}
                    style={{padding:'6px 12px',borderRadius:20,border:`1.5px solid ${active?moodDraft.color:C.border}`,
                      background:active?moodDraft.color+'18':C.surfaceAlt,color:active?moodDraft.color:C.textSec,
                      fontSize:12,fontWeight:active?700:400,cursor:'pointer',fontFamily:F}}>
                    {m}
                  </button>
                );
              })}
            </div>
            <textarea value={moodNote} onChange={e=>setMoodNote(e.target.value)}
              placeholder="Nota opcional... (ej. 'comí por ansiedad')"
              rows={2}
              style={{width:'100%',padding:'11px 14px',border:`1.5px solid ${C.border}`,borderRadius:14,fontSize:13,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none',resize:'none',marginBottom:14,boxSizing:'border-box'}}/>
            <button className="tap" onClick={()=>{
              const entry={ts:Date.now(),mood:moodDraft.l,emoji:moodDraft.e,comida:moodDraft._comida&&moodDraft._comida!=='—'?moodDraft._comida:null,nota:moodNote.trim()};
              setMoodEntries(prev=>[...prev,entry]);
              setShowMoodModal(false);
              setMoodNote('');
              haptic('success');
              setToast(`${moodDraft.e} ¡Registrado!`);
            }} style={{width:'100%',padding:'13px',borderRadius:16,border:'none',background:moodDraft.color,color:'white',fontSize:15,fontWeight:800,cursor:'pointer',fontFamily:F}}>
              Guardar estado de ánimo
            </button>
          </div>
        </div>
      )}

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

      {/* ══ NUTRIBOT FLOTANTE ══ */}
      {tab===0&&(
        <button className="tap float-in" onClick={()=>{ if(!isPro){setShowPaywall(true);return;} setShowAI(true); }}
          style={{
            position:'fixed', bottom:'calc(90px + env(safe-area-inset-bottom, 0px))', right:16,
            zIndex:25, background:'none', border:'none', cursor:'pointer', padding:0,
            WebkitTapHighlightColor:'transparent',
          }}>
          <NutriBot state={nutribotHappy?'happy':'idle'} size={58} outfit={nutribotOutfit}/>
          <div style={{
            position:'absolute', top:-4, right:-4,
            background:'#D42020', color:'white',
            fontSize:8, fontWeight:800, borderRadius:8, padding:'2px 5px',
            fontFamily:F, letterSpacing:.3, boxShadow:'0 2px 6px rgba(212,32,32,0.4)',
          }}>{isPro?'IA':'PRO'}</div>
        </button>
      )}

      {/* ══ BOTTOM NAV ══ */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:30,background:C.navBg,backdropFilter:'blur(16px)',borderTop:`1px solid ${C.border}`,padding:'8px 8px calc(18px + env(safe-area-inset-bottom))',display:'flex',transition:'background .3s'}}>
        {[{icon:'🏠',lbl:'Inicio'},{icon:'➕',lbl:'Agregar'},{icon:'📋',lbl:'Mi Día'},{icon:'📊',lbl:'Stats'},{icon:'👤',lbl:'Perfil'}].map(({icon,lbl},i)=>(
          <button key={i} className="nav-btn tap" onClick={()=>goTab(i)} style={{
            flex:1,border:'none',background:'none',cursor:'pointer',fontFamily:F,
            display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'5px 0',
          }}>
            <div style={{
              width:44,height:32,borderRadius:22,
              background:tab===i?accent+'20':'transparent',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,
              transform:tab===i?'scale(1.15)':'scale(1)',
              transition:'all .28s cubic-bezier(.34,1.56,.64,1)',
            }}>{icon}</div>
            <div style={{
              fontSize:10,
              fontWeight:tab===i?700:400,
              color:tab===i?accent:C.textMuted,
              transition:'all .2s ease',
              letterSpacing:'-.2px',
            }}>{lbl}</div>
          </button>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth]   = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !guestMode) setShowAuth(true);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setShowAuth(false);
        setAuthReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = (user) => {
    if (!user) setGuestMode(true);
    setShowAuth(false);
  };

  if (!authReady) return (
    <div style={{position:'fixed',inset:0,background:'#F2F2F7',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:48}}>🥗</div>
    </div>
  );

  if (showAuth) return <AuthScreen onAuth={handleAuth}/>;

  return (
    <ErrorBoundary>
      <AppCore onRequestAuth={()=>setShowAuth(true)}/>
    </ErrorBoundary>
  );
}
