import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { supabase, syncProfile, syncSettings, syncDay, syncWeight, restoreFromSupabase } from './supabase.js';

/* ═══════════════════════════════════════════════════════
   BASE DE DATOS — 300+ productos supermercados chilenos
   porcion = gramos de la porción de referencia
═══════════════════════════════════════════════════════ */
const DB = [
  /* ── LÁCTEOS ── */
  {id:1,  nombre:"Leche entera Soprole",          marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:160, prot:8,   carbs:12,  grasas:9,   fibra:0, azucar:4.8, sodio:120,   emoji:"🥛"},
  {id:2,  nombre:"Leche semidescremada Soprole",  marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:120, prot:9,   carbs:12,  grasas:4.5, fibra:0, azucar:4.8, sodio:130,   emoji:"🥛"},
  {id:3,  nombre:"Leche descremada Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:250, cal:90,  prot:9,   carbs:12,  grasas:0.5, fibra:0, azucar:4.8, sodio:130,   emoji:"🥛"},
  {id:4,  nombre:"Leche entera Colun",            marca:"Colun",        cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:11,  grasas:8.5, fibra:0, azucar:12, sodio:110,   emoji:"🥛"},
  {id:5,  nombre:"Leche semidescremada Colun",    marca:"Colun",        cat:"Lácteos",    porcion:250, cal:118, prot:9,   carbs:12,  grasas:4,   fibra:0, azucar:3.5, sodio:60,   emoji:"🥛"},
  {id:6,  nombre:"Leche entera Loncoleche",       marca:"Loncoleche",   cat:"Lácteos",    porcion:250, cal:158, prot:8,   carbs:12,  grasas:9,   fibra:0, azucar:11, sodio:80,   emoji:"🥛"},
  {id:7,  nombre:"Leche de avena Oatly",          marca:"Oatly",        cat:"Lácteos",    porcion:250, cal:120, prot:3,   carbs:16,  grasas:5,   fibra:1.5, azucar:10, sodio:45, emoji:"🥛"},
  {id:8,  nombre:"Leche de almendra Blue Diamond",marca:"Blue Diamond", cat:"Lácteos",    porcion:250, cal:50,  prot:1.5, carbs:4,   grasas:3,   fibra:0.5, azucar:4, sodio:35, emoji:"🥛"},
  {id:9,  nombre:"Leche de soja Alpro",           marca:"Alpro",        cat:"Lácteos",    porcion:250, cal:95,  prot:8,   carbs:7,   grasas:4,   fibra:0.5, azucar:0, sodio:400, emoji:"🥛"},
  {id:10, nombre:"Leche de coco Aroy-D (200ml)",  marca:"Aroy-D",       cat:"Lácteos",    porcion:200, cal:280, prot:3,   carbs:4,   grasas:28,  fibra:0, azucar:0.3, sodio:350,   emoji:"🥥"},
  {id:11, nombre:"Yogurt natural Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:120, prot:7,   carbs:14,  grasas:4,   fibra:0, azucar:0, sodio:200,   emoji:"🥣"},
  {id:12, nombre:"Yogurt con fruta Soprole",      marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:140, prot:6,   carbs:20,  grasas:3.5, fibra:0, azucar:0, sodio:180,   emoji:"🥣"},
  {id:13, nombre:"Yogurt 0% Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:150, cal:80,  prot:8,   carbs:12,  grasas:0,   fibra:0, azucar:4.8, sodio:120,   emoji:"🥣"},
  {id:14, nombre:"Yogurt natural Colun",          marca:"Colun",        cat:"Lácteos",    porcion:150, cal:135, prot:6,   carbs:15,  grasas:5,   fibra:0, azucar:4.8, sodio:130,   emoji:"🥣"},
  {id:15, nombre:"Yogurt griego Danone",          marca:"Danone",       cat:"Lácteos",    porcion:150, cal:135, prot:10,  carbs:13,  grasas:4,   fibra:0, azucar:11, sodio:80,   emoji:"🥣"},
  {id:16, nombre:"Yogurt griego 0% Danone",       marca:"Danone",       cat:"Lácteos",    porcion:150, cal:85,  prot:10,  carbs:13,  grasas:0,   fibra:0, azucar:13, sodio:90,   emoji:"🥣"},
  {id:17, nombre:"Yogurt bebible Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:200, cal:160, prot:6,   carbs:26,  grasas:3,   fibra:0, azucar:0.5, sodio:25,   emoji:"🥤"},
  {id:18, nombre:"Kéfir natural Colun",           marca:"Colun",        cat:"Lácteos",    porcion:150, cal:110, prot:7,   carbs:12,  grasas:3.5, fibra:0, azucar:13, sodio:90,   emoji:"🥣"},
  {id:19, nombre:"Queso gauda Colun",             marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:105, prot:7,   carbs:0.5, grasas:8.5, fibra:0, azucar:4.8, sodio:10,   emoji:"🧀"},
  {id:20, nombre:"Queso chanco Colun",            marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:95,  prot:6,   carbs:1,   grasas:8,   fibra:0, azucar:4.8, sodio:10,   emoji:"🧀"},
  {id:21, nombre:"Queso mantecoso Colun",         marca:"Colun",        cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:1,   grasas:8,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:22, nombre:"Queso laminado Soprole",        marca:"Soprole",      cat:"Lácteos",    porcion:25,  cal:80,  prot:5.5, carbs:0.5, grasas:6.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:23, nombre:"Queso crema Philadelphia",      marca:"Kraft",        cat:"Lácteos",    porcion:30,  cal:90,  prot:2,   carbs:1.5, grasas:9,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:24, nombre:"Queso crema Soprole",           marca:"Soprole",      cat:"Lácteos",    porcion:30,  cal:85,  prot:2,   carbs:2,   grasas:8,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:25, nombre:"Ricotta Soprole",               marca:"Soprole",      cat:"Lácteos",    porcion:50,  cal:80,  prot:5,   carbs:2,   grasas:6,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:26, nombre:"Queso brie importado",          marca:"Genérico",     cat:"Lácteos",    porcion:30,  cal:100, prot:6,   carbs:0,   grasas:8.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:27, nombre:"Queso parmesano rallado",       marca:"Genérico",     cat:"Lácteos",    porcion:15,  cal:55,  prot:5,   carbs:0,   grasas:4,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧀"},
  {id:28, nombre:"Manjar Colun",                  marca:"Colun",        cat:"Lácteos",    porcion:15,  cal:55,  prot:1,   carbs:12,  grasas:0.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🍯"},
  {id:29, nombre:"Mantequilla Colun",             marca:"Colun",        cat:"Lácteos",    porcion:10,  cal:72,  prot:0.1, carbs:0,   grasas:8,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧈"},
  {id:30, nombre:"Margarina Soprole",             marca:"Soprole",      cat:"Lácteos",    porcion:10,  cal:62,  prot:0,   carbs:0,   grasas:7,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧈"},
  {id:31, nombre:"Crema Soprole",                 marca:"Soprole",      cat:"Lácteos",    porcion:100, cal:330, prot:2.5, carbs:3,   grasas:35,  fibra:0, azucar:4.5, sodio:10,   emoji:"🫙"},

  /* ── CARNES ── */
  {id:40, nombre:"Pechuga de pollo Ariztía",      marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:110, prot:23,  carbs:0,   grasas:1.5, fibra:0, azucar:0, sodio:60,   emoji:"🍗"},
  {id:41, nombre:"Trutro de pollo Ariztía",       marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:185, prot:18,  carbs:0,   grasas:12,  fibra:0, azucar:0, sodio:60,   emoji:"🍗"},
  {id:42, nombre:"Pechuga Super Pollo",           marca:"Super Pollo",  cat:"Carnes",     porcion:100, cal:108, prot:22,  carbs:0,   grasas:2,   fibra:0, azucar:0, sodio:60,   emoji:"🍗"},
  {id:43, nombre:"Filete de pollo congelado",     marca:"Ariztía",      cat:"Carnes",     porcion:100, cal:112, prot:22,  carbs:1,   grasas:2,   fibra:0, azucar:0, sodio:60,   emoji:"🍗"},
  {id:44, nombre:"Filete de vacuno",              marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:27,  carbs:0,   grasas:7,   fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:45, nombre:"Lomo de vacuno",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:215, prot:26,  carbs:0,   grasas:12,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:46, nombre:"Asado de tira",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:24,  carbs:0,   grasas:17,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:47, nombre:"Palanca de vacuno",             marca:"Natural",      cat:"Carnes",     porcion:100, cal:180, prot:25,  carbs:0,   grasas:9,   fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:48, nombre:"Punta de ganso",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:160, prot:26,  carbs:0,   grasas:5.5, fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:49, nombre:"Punta picana",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:25,  carbs:0,   grasas:10,  fibra:0, azucar:0, sodio:60,   emoji:"🥩"},
  {id:50, nombre:"Carne molida 80% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:255, prot:17,  carbs:0,   grasas:20,  fibra:0, azucar:39, sodio:45,   emoji:"🥩"},
  {id:51, nombre:"Carne molida 90% magra",        marca:"Natural",      cat:"Carnes",     porcion:100, cal:175, prot:20,  carbs:0,   grasas:10,  fibra:0, azucar:39, sodio:50,   emoji:"🥩"},
  {id:52, nombre:"Cerdo chuleta",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:195, prot:24,  carbs:0,   grasas:10,  fibra:0, azucar:42, sodio:40,   emoji:"🥩"},
  {id:53, nombre:"Lomo de cerdo",                 marca:"Natural",      cat:"Carnes",     porcion:100, cal:165, prot:25,  carbs:0,   grasas:6.5, fibra:0, azucar:0, sodio:5,   emoji:"🥩"},
  {id:54, nombre:"Plateada de vacuno",            marca:"Natural",      cat:"Carnes",     porcion:100, cal:290, prot:22,  carbs:0,   grasas:22,  fibra:0, azucar:0, sodio:2,   emoji:"🥩"},
  {id:55, nombre:"Pavo pechuga",                  marca:"Natural",      cat:"Carnes",     porcion:100, cal:105, prot:24,  carbs:0,   grasas:1,   fibra:0, azucar:28, sodio:30,   emoji:"🍗"},
  {id:56, nombre:"Cordero pierna",                marca:"Natural",      cat:"Carnes",     porcion:100, cal:250, prot:25,  carbs:0,   grasas:16,  fibra:0, azucar:26, sodio:2,   emoji:"🥩"},
  {id:57, nombre:"Hamburguesa vacuno 150g",       marca:"Genérico",     cat:"Carnes",     porcion:150, cal:380, prot:26,  carbs:0,   grasas:30,  fibra:0, azucar:22, sodio:5,   emoji:"🍔"},
  {id:58, nombre:"Hamburguesa pollo Ariztía 85g", marca:"Ariztía",      cat:"Carnes",     porcion:85,  cal:190, prot:14,  carbs:5,   grasas:13,  fibra:0, azucar:0, sodio:5,   emoji:"🍔"},

  /* ── CECINAS ── */
  {id:60, nombre:"Vienesa San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:40,  cal:130, prot:6,   carbs:2,   grasas:11,  fibra:0, azucar:28, sodio:25,   emoji:"🌭"},
  {id:61, nombre:"Vienesa Otto Kunkel",           marca:"Otto Kunkel",  cat:"Cecinas",    porcion:40,  cal:135, prot:6,   carbs:2,   grasas:11.5,fibra:0, azucar:12, sodio:100,   emoji:"🌭"},
  {id:62, nombre:"Jamón de pavo San Jorge",       marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:30,  prot:5.5, carbs:0.5, grasas:0.7, fibra:0, azucar:0, sodio:700,   emoji:"🥩"},
  {id:63, nombre:"Jamón de cerdo San Jorge",      marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:50,  prot:5,   carbs:0.5, grasas:3,   fibra:0, azucar:10, sodio:700,   emoji:"🥩"},
  {id:64, nombre:"Mortadela San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:25,  cal:70,  prot:4,   carbs:2,   grasas:5.5, fibra:0, azucar:38, sodio:700,   emoji:"🥩"},
  {id:65, nombre:"Salame Montserrat",             marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:110, prot:7,   carbs:0.5, grasas:9,   fibra:0, azucar:0, sodio:700,   emoji:"🥩"},
  {id:66, nombre:"Jamón serrano Montserrat",      marca:"Montserrat",   cat:"Cecinas",    porcion:25,  cal:55,  prot:7,   carbs:0,   grasas:3,   fibra:0, azucar:32, sodio:700,   emoji:"🥩"},
  {id:67, nombre:"Paté hígado Montserrat",        marca:"Montserrat",   cat:"Cecinas",    porcion:30,  cal:100, prot:5,   carbs:1,   grasas:9,   fibra:0, azucar:24, sodio:700,   emoji:"🫙"},
  {id:68, nombre:"Chorizo San Jorge",             marca:"San Jorge",    cat:"Cecinas",    porcion:50,  cal:165, prot:8,   carbs:2,   grasas:14,  fibra:0, azucar:36, sodio:700,   emoji:"🌭"},
  {id:69, nombre:"Tocino ahumado",                marca:"Genérico",     cat:"Cecinas",    porcion:30,  cal:130, prot:5,   carbs:0.5, grasas:12,  fibra:0, azucar:30, sodio:700,   emoji:"🥓"},
  {id:70, nombre:"Pepperoni San Jorge",           marca:"San Jorge",    cat:"Cecinas",    porcion:30,  cal:120, prot:6,   carbs:1,   grasas:10,  fibra:0, azucar:0, sodio:700,   emoji:"🥩"},

  /* ── PANES ── */
  {id:80, nombre:"Marraqueta",                    marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:230, prot:7,   carbs:44,  grasas:2.5, fibra:2, azucar:2, sodio:380,   emoji:"🍞"},
  {id:81, nombre:"Hallulla",                      marca:"Artesanal",    cat:"Panes",      porcion:70,  cal:200, prot:6,   carbs:38,  grasas:3,   fibra:1.5, azucar:2, sodio:380, emoji:"🫓"},
  {id:82, nombre:"Pan molde blanco Harry's",      marca:"Harry's",      cat:"Panes",      porcion:30,  cal:75,  prot:2.5, carbs:14,  grasas:1,   fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:83, nombre:"Pan molde integral Harry's",    marca:"Harry's",      cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:0.8, fibra:2, azucar:2, sodio:380,   emoji:"🍞"},
  {id:84, nombre:"Pan molde Bimbo blanco",        marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:72,  prot:2.5, carbs:14,  grasas:0.8, fibra:0.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:85, nombre:"Pan molde Bimbo integral",      marca:"Bimbo",        cat:"Panes",      porcion:30,  cal:68,  prot:3,   carbs:12,  grasas:1,   fibra:2.5, azucar:2, sodio:380, emoji:"🍞"},
  {id:86, nombre:"Pan de molde sin gluten Schär", marca:"Schär",        cat:"Panes",      porcion:35,  cal:90,  prot:2.5, carbs:17,  grasas:1.5, fibra:1, azucar:2, sodio:380,   emoji:"🍞"},
  {id:87, nombre:"Pan pita Ideal",                marca:"Ideal",        cat:"Panes",      porcion:60,  cal:155, prot:5,   carbs:30,  grasas:1.5, fibra:1, azucar:2, sodio:380,   emoji:"🫓"},
  {id:88, nombre:"Pan ciabatta",                  marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:215, prot:7,   carbs:41,  grasas:2,   fibra:1.5, azucar:2, sodio:380, emoji:"🥖"},
  {id:89, nombre:"Baguette",                      marca:"Artesanal",    cat:"Panes",      porcion:80,  cal:220, prot:7,   carbs:43,  grasas:1.5, fibra:1.5, azucar:2, sodio:380, emoji:"🥖"},
  {id:90, nombre:"Sopaipilla",                    marca:"Artesanal",    cat:"Panes",      porcion:60,  cal:155, prot:3,   carbs:22,  grasas:6.5, fibra:1, azucar:2, sodio:380,   emoji:"🫓"},
  {id:91, nombre:"Tostadas de agua Luchetti",     marca:"Luchetti",     cat:"Panes",      porcion:20,  cal:75,  prot:2,   carbs:15,  grasas:0.5, fibra:0.5, azucar:2, sodio:380, emoji:"🍘"},
  {id:92, nombre:"Galletas de arroz Galletas",    marca:"Genérico",     cat:"Panes",      porcion:20,  cal:72,  prot:1.5, carbs:15,  grasas:0.5, fibra:0.5, azucar:2, sodio:380, emoji:"🍘"},
  {id:93, nombre:"Pan de centeno",                marca:"Artesanal",    cat:"Panes",      porcion:35,  cal:85,  prot:3,   carbs:16,  grasas:0.8, fibra:2.5, azucar:2, sodio:380, emoji:"🍞"},

  /* ── CEREALES ── */
  {id:100,nombre:"Avena Quaker tradicional",      marca:"Quaker",       cat:"Cereales",   porcion:45,  cal:170, prot:6,   carbs:30,  grasas:3,   fibra:4, azucar:8, sodio:290,   emoji:"🌾"},
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
  {id:180,nombre:"Palta Hass",                    marca:"Natural",      cat:"Frutas",     porcion:80,  cal:130, prot:1.5, carbs:7,   grasas:12,  fibra:5, azucar:10, sodio:2,   emoji:"🥑"},
  {id:181,nombre:"Manzana fuji",                  marca:"Natural",      cat:"Frutas",     porcion:150, cal:80,  prot:0.5, carbs:20,  grasas:0.3, fibra:3, azucar:10, sodio:2,   emoji:"🍎"},
  {id:182,nombre:"Plátano",                       marca:"Natural",      cat:"Frutas",     porcion:120, cal:105, prot:1.5, carbs:27,  grasas:0.3, fibra:3, azucar:10, sodio:2,   emoji:"🍌"},
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
  {id:200,nombre:"Tomate",                        marca:"Natural",      cat:"Verduras",   porcion:120, cal:25,  prot:1,   carbs:5,   grasas:0.3, fibra:1.5, azucar:45, sodio:270, emoji:"🍅"},
  {id:201,nombre:"Lechuga romana",                marca:"Natural",      cat:"Verduras",   porcion:80,  cal:14,  prot:1,   carbs:2,   grasas:0.2, fibra:1.5, azucar:20, sodio:20, emoji:"🥬"},
  {id:202,nombre:"Espinaca",                      marca:"Natural",      cat:"Verduras",   porcion:80,  cal:18,  prot:2.5, carbs:2,   grasas:0.3, fibra:1.5, azucar:38, sodio:20, emoji:"🥬"},
  {id:203,nombre:"Choclo",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:65,  prot:2,   carbs:14,  grasas:0.7, fibra:1.5, azucar:25, sodio:20, emoji:"🌽"},
  {id:204,nombre:"Zanahoria",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:41,  prot:0.9, carbs:10,  grasas:0.2, fibra:2.8, azucar:30, sodio:20, emoji:"🥕"},
  {id:205,nombre:"Cebolla",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:40,  prot:1,   carbs:9,   grasas:0.1, fibra:1.7, azucar:35, sodio:20, emoji:"🧅"},
  {id:206,nombre:"Papa blanca",                   marca:"Natural",      cat:"Verduras",   porcion:150, cal:120, prot:2.5, carbs:27,  grasas:0.2, fibra:2.5, azucar:40, sodio:20, emoji:"🥔"},
  {id:207,nombre:"Camote/batata",                 marca:"Natural",      cat:"Verduras",   porcion:150, cal:130, prot:2,   carbs:30,  grasas:0.2, fibra:4, azucar:22, sodio:20,   emoji:"🍠"},
  {id:208,nombre:"Brócoli",                       marca:"Natural",      cat:"Verduras",   porcion:100, cal:34,  prot:2.8, carbs:7,   grasas:0.4, fibra:2.6, azucar:28, sodio:20, emoji:"🥦"},
  {id:209,nombre:"Coliflor",                      marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:2,   carbs:5,   grasas:0.3, fibra:2, azucar:32, sodio:20,   emoji:"🥦"},
  {id:210,nombre:"Pepino",                        marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.1, fibra:1, azucar:18, sodio:20,   emoji:"🥒"},
  {id:211,nombre:"Pimentón rojo",                 marca:"Natural",      cat:"Verduras",   porcion:120, cal:38,  prot:1.5, carbs:9,   grasas:0.3, fibra:3, azucar:50, sodio:20,   emoji:"🫑"},
  {id:212,nombre:"Pimentón verde",                marca:"Natural",      cat:"Verduras",   porcion:120, cal:30,  prot:1,   carbs:7,   grasas:0.2, fibra:2.5, azucar:35, sodio:20, emoji:"🫑"},
  {id:213,nombre:"Zapallo camote",                marca:"Natural",      cat:"Verduras",   porcion:100, cal:26,  prot:1,   carbs:6,   grasas:0.1, fibra:1.5, azucar:20, sodio:380, emoji:"🎃"},
  {id:214,nombre:"Berenjena",                     marca:"Natural",      cat:"Verduras",   porcion:100, cal:25,  prot:1,   carbs:6,   grasas:0.2, fibra:3, azucar:2, sodio:200,   emoji:"🍆"},
  {id:215,nombre:"Poroto verde",                  marca:"Natural",      cat:"Verduras",   porcion:100, cal:31,  prot:1.8, carbs:7,   grasas:0.1, fibra:2.7, azucar:1, sodio:20, emoji:"🫘"},
  {id:216,nombre:"Apio",                          marca:"Natural",      cat:"Verduras",   porcion:100, cal:16,  prot:0.7, carbs:3,   grasas:0.2, fibra:1.6, azucar:2, sodio:20, emoji:"🌿"},
  {id:217,nombre:"Champiñones",                   marca:"Natural",      cat:"Verduras",   porcion:100, cal:22,  prot:3,   carbs:3,   grasas:0.3, fibra:1, azucar:2, sodio:20,   emoji:"🍄"},
  {id:218,nombre:"Ajo",                           marca:"Natural",      cat:"Verduras",   porcion:10,  cal:15,  prot:0.6, carbs:3.4, grasas:0.1, fibra:0.2, azucar:2, sodio:20, emoji:"🧄"},

  /* ── LEGUMBRES ── */
  {id:225,nombre:"Lentejas cocidas Gallo",        marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:115, prot:9,   carbs:20,  grasas:0.4, fibra:8, azucar:1, sodio:5,   emoji:"🫘"},
  {id:226,nombre:"Porotos negros Gallo",          marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:130, prot:9,   carbs:24,  grasas:0.5, fibra:7, azucar:1, sodio:5,   emoji:"🫘"},
  {id:227,nombre:"Garbanzos cocidos",             marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:165, prot:9,   carbs:27,  grasas:2.5, fibra:8, azucar:1, sodio:5,   emoji:"🫘"},
  {id:228,nombre:"Porotos blancos cocidos",       marca:"Gallo",        cat:"Legumbres",  porcion:100, cal:125, prot:8.5, carbs:23,  grasas:0.4, fibra:7, azucar:1, sodio:5,   emoji:"🫘"},
  {id:229,nombre:"Arvejas cocidas",               marca:"Natural",      cat:"Legumbres",  porcion:100, cal:84,  prot:5.5, carbs:15,  grasas:0.4, fibra:5, azucar:1, sodio:5,   emoji:"🫛"},
  {id:230,nombre:"Edamame",                       marca:"Natural",      cat:"Legumbres",  porcion:100, cal:121, prot:11,  carbs:10,  grasas:5,   fibra:5, azucar:1, sodio:5,   emoji:"🫛"},
  {id:231,nombre:"Hummus",                        marca:"Genérico",     cat:"Legumbres",  porcion:60,  cal:140, prot:5,   carbs:12,  grasas:8,   fibra:3.5, azucar:1, sodio:5, emoji:"🫙"},

  /* ── GRANOS / PASTAS / ARROZ ── */
  {id:235,nombre:"Arroz blanco cocido",           marca:"Genérico",     cat:"Granos",     porcion:100, cal:130, prot:2.7, carbs:28,  grasas:0.3, fibra:0.4, azucar:0.5, sodio:5, emoji:"🍚"},
  {id:236,nombre:"Arroz integral cocido",         marca:"Genérico",     cat:"Granos",     porcion:100, cal:110, prot:2.5, carbs:23,  grasas:0.8, fibra:1.8, azucar:0.5, sodio:5, emoji:"🍚"},
  {id:237,nombre:"Pasta Carozzi espagueti",       marca:"Carozzi",      cat:"Granos",     porcion:100, cal:360, prot:12,  carbs:72,  grasas:1.5, fibra:3, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:238,nombre:"Pasta Carozzi cocida",          marca:"Carozzi",      cat:"Granos",     porcion:100, cal:160, prot:5.5, carbs:32,  grasas:0.9, fibra:2, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:239,nombre:"Pasta integral Carozzi",        marca:"Carozzi",      cat:"Granos",     porcion:100, cal:345, prot:13,  carbs:68,  grasas:2,   fibra:8, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:240,nombre:"Pasta integral cocida",         marca:"Carozzi",      cat:"Granos",     porcion:100, cal:150, prot:6,   carbs:30,  grasas:1,   fibra:4, azucar:0.5, sodio:5,   emoji:"🍝"},
  {id:241,nombre:"Quinoa cocida",                 marca:"Genérico",     cat:"Granos",     porcion:100, cal:120, prot:4.5, carbs:21,  grasas:2,   fibra:2.8, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:242,nombre:"Quinoa seca",                   marca:"Genérico",     cat:"Granos",     porcion:40,  cal:155, prot:6,   carbs:27,  grasas:2.5, fibra:3.5, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:243,nombre:"Avena seca",                    marca:"Genérico",     cat:"Granos",     porcion:40,  cal:150, prot:5,   carbs:26,  grasas:2.5, fibra:3.5, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:244,nombre:"Arroz seco Gallo",              marca:"Gallo",        cat:"Granos",     porcion:50,  cal:180, prot:3.5, carbs:40,  grasas:0.5, fibra:0.5, azucar:0.5, sodio:5, emoji:"🌾"},
  {id:245,nombre:"Cous cous cocido",              marca:"Genérico",     cat:"Granos",     porcion:100, cal:112, prot:3.8, carbs:23,  grasas:0.2, fibra:1.5, azucar:0.5, sodio:5, emoji:"🌾"},

  /* ── PESCADOS / MARISCOS ── */
  {id:250,nombre:"Reineta al horno",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:115, prot:20,  carbs:0,   grasas:3.5, fibra:0, azucar:20, sodio:400,   emoji:"🐟"},
  {id:251,nombre:"Salmón fresco",                 marca:"Natural",      cat:"Pescados",   porcion:100, cal:200, prot:20,  carbs:0,   grasas:13,  fibra:0, azucar:5, sodio:160,   emoji:"🐟"},
  {id:252,nombre:"Merluza al vapor",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:80,  prot:18,  carbs:0,   grasas:0.8, fibra:0, azucar:0, sodio:480,   emoji:"🐟"},
  {id:253,nombre:"Congrio colorado",              marca:"Natural",      cat:"Pescados",   porcion:100, cal:95,  prot:19,  carbs:0,   grasas:2,   fibra:0, azucar:15, sodio:80,   emoji:"🐟"},
  {id:254,nombre:"Jurel en conserva",             marca:"Genérico",     cat:"Pescados",   porcion:100, cal:150, prot:22,  carbs:0,   grasas:7,   fibra:0, azucar:0, sodio:80,   emoji:"🥫"},
  {id:255,nombre:"Atún Salmonte en agua",         marca:"Salmonte",     cat:"Pescados",   porcion:100, cal:100, prot:23,  carbs:0,   grasas:1,   fibra:0, azucar:0, sodio:80,   emoji:"🥫"},
  {id:256,nombre:"Sardinas en aceite",            marca:"Genérico",     cat:"Pescados",   porcion:85,  cal:190, prot:23,  carbs:0,   grasas:11,  fibra:0, azucar:60, sodio:80,   emoji:"🥫"},
  {id:257,nombre:"Machas al natural",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:55,  prot:10,  carbs:3,   grasas:0.5, fibra:0, azucar:0, sodio:38800,   emoji:"🦪"},
  {id:258,nombre:"Camarones cocidos",             marca:"Natural",      cat:"Pescados",   porcion:100, cal:99,  prot:21,  carbs:0,   grasas:1,   fibra:0, azucar:99, sodio:0,   emoji:"🦐"},
  {id:259,nombre:"Albacora (pez espada)",         marca:"Natural",      cat:"Pescados",   porcion:100, cal:145, prot:20,  carbs:0,   grasas:7,   fibra:0, azucar:97, sodio:0,   emoji:"🐟"},
  {id:260,nombre:"Salmón ahumado",                marca:"Genérico",     cat:"Pescados",   porcion:50,  cal:85,  prot:11,  carbs:0,   grasas:4.5, fibra:0, azucar:82, sodio:40,   emoji:"🐟"},

  /* ── HUEVOS ── */
  {id:265,nombre:"Huevo entero grande",           marca:"Natural",      cat:"Huevos",     porcion:60,  cal:70,  prot:6,   carbs:0.5, grasas:5,   fibra:0, azucar:0, sodio:70,   emoji:"🥚"},
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
  {id:404,nombre:"Arroz grano largo Líder",         marca:"Líder",        cat:"Granos",     porcion:50,  cal:178, prot:3.5, carbs:39,  grasas:0.4, fibra:0.5, azucar:0.5, sodio:5, emoji:"🍚"},
  {id:405,nombre:"Aceite maravilla Líder",          marca:"Líder",        cat:"Aceites",    porcion:15,  cal:124, prot:0,   carbs:0,   grasas:14,  fibra:0, azucar:0, sodio:0,   emoji:"🫙"},
  {id:406,nombre:"Azúcar Líder",                    marca:"Líder",        cat:"Condimentos",porcion:5,   cal:20,  prot:0,   carbs:5,   grasas:0,   fibra:0, azucar:8, sodio:300,   emoji:"🍬"},
  {id:407,nombre:"Fideos Líder espagueti",          marca:"Líder",        cat:"Granos",     porcion:80,  cal:288, prot:10,  carbs:57,  grasas:1.5, fibra:2.5, azucar:0.5, sodio:5, emoji:"🍝"},
  {id:408,nombre:"Atún Líder al agua",              marca:"Líder",        cat:"Pescados",   porcion:100, cal:98,  prot:22,  carbs:0,   grasas:1,   fibra:0, azucar:0, sodio:80,   emoji:"🥫"},
  {id:409,nombre:"Porotos negros Líder",            marca:"Líder",        cat:"Legumbres",  porcion:100, cal:127, prot:8.5, carbs:23,  grasas:0.5, fibra:7, azucar:1, sodio:5,   emoji:"🫘"},
  {id:410,nombre:"Granola Líder con miel",          marca:"Líder",        cat:"Cereales",   porcion:45,  cal:188, prot:4,   carbs:32,  grasas:5.5, fibra:3, azucar:12, sodio:200,   emoji:"🥣"},
  {id:411,nombre:"Leche condensada Líder",          marca:"Líder",        cat:"Lácteos",    porcion:40,  cal:128, prot:3,   carbs:22,  grasas:3.5, fibra:0, azucar:4.5, sodio:10,   emoji:"🥛"},
  {id:412,nombre:"Mantequilla Líder con sal",       marca:"Líder",        cat:"Lácteos",    porcion:10,  cal:71,  prot:0.1, carbs:0,   grasas:8,   fibra:0, azucar:4.5, sodio:10,   emoji:"🧈"},
  {id:413,nombre:"Mote Unimarc",                    marca:"Unimarc",      cat:"Granos",     porcion:100, cal:155, prot:4,   carbs:33,  grasas:0.8, fibra:2, azucar:0.5, sodio:5,   emoji:"🌾"},
  {id:414,nombre:"Lentejas Unimarc",                marca:"Unimarc",      cat:"Legumbres",  porcion:60,  cal:202, prot:14,  carbs:33,  grasas:0.8, fibra:11, azucar:1, sodio:5,  emoji:"🫘"},
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

  /* ── SUPLEMENTOS ── */
  {id:320,nombre:"Whey protein Gold Standard",    marca:"ON",           cat:"Suplementos",porcion:31,  cal:120, prot:24,  carbs:3,   grasas:2,   fibra:0, azucar:3, sodio:100,   emoji:"💪"},
  {id:321,nombre:"Proteína vegana (guisante)",    marca:"Genérico",     cat:"Suplementos",porcion:30,  cal:110, prot:20,  carbs:5,   grasas:2.5, fibra:1, azucar:3, sodio:100,   emoji:"🌱"},
  {id:322,nombre:"Barra proteica Quest",          marca:"Quest",        cat:"Suplementos",porcion:60,  cal:190, prot:21,  carbs:22,  grasas:8,   fibra:14, azucar:3, sodio:100,  emoji:"🍫"},
  {id:323,nombre:"Creatina monohidratada",        marca:"Genérico",     cat:"Suplementos",porcion:5,   cal:0,   prot:0,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"⚗️"},
  {id:324,nombre:"BCAA polvo",                    marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:8,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"💊"},
  {id:325,nombre:"Colágeno hidrolizado",          marca:"Genérico",     cat:"Suplementos",porcion:10,  cal:35,  prot:9,   carbs:0,   grasas:0,   fibra:0, azucar:3, sodio:100,   emoji:"✨"},
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
   TIPS NUTRICIONALES
═══════════════════════════════════════════════════════ */
const getTips = (tot, metas, obj, agua, pct, exercises, streak) => {
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
    tips.push({icon:'💧', text:`Solo ${agua} vasos de agua. Tomar más mejora el metabolismo.`, color:'#007AFF'});
  if(agua >= 8)
    tips.push({icon:'💧', text:'¡Hidratación perfecta! Tu cuerpo te lo agradece.', color:'#007AFF'});
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
const CATS = ["Todas","Lácteos","Carnes","Cecinas","Panes","Cereales","Snacks","Bebidas","Frutas","Verduras","Legumbres","Granos","Pescados","Huevos","Comidas CL","Congelados","Comida rápida","Preparados","Aceites","Condimentos","Suplementos","Mis alimentos","Mis recetas","Escaneado"];
const MEALS = ["Desayuno","Almuerzo","Once","Cena","Snack"];
const MC = {Desayuno:"#FF9500",Almuerzo:"#FF3B30",Once:"#AF52DE",Cena:"#007AFF",Snack:"#34C759"};
const MI = {Desayuno:"🌅",Almuerzo:"☀️",Once:"☕",Cena:"🌙",Snack:"🍎"};

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
const calcMetas = (tdee, obj, pesoKg=70) => {
  /* Déficit/superávit en % del TDEE (más seguro que valor fijo) */
  const ajuste = {
    bajar:   -0.20,  // -20% TDEE → déficit moderado y sostenible
    mantener: 0,
    recomp:   0,
    subir:    0.12,  // +12% TDEE → superávit limpio para ganar masa
  };
  const d = ajuste[obj] ?? 0;
  const cal = Math.max(tdee * 0.70, Math.round(tdee + tdee*d)); // mínimo 70% TDEE

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
  color: '#007AFF',
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
  mantener:{light:'#007AFF', dark:'#0A84FF'},
  recomp:  {light:'#AF52DE', dark:'#BF5AF2'},
  subir:   {light:'#34C759', dark:'#30D158'},
};

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

  const [tip, setTip] = useState('');
  useEffect(()=>{
    const t0=setTimeout(()=>{setPhase(1);setTip('Cargando tu catálogo...');setBarW(30);}, 100);
    const t1=setTimeout(()=>{setPhase(2);setTip('Calculando tus macros...');setBarW(70);}, 700);
    const t2=setTimeout(()=>{setTip('¡Listo!');setBarW(100);}, 1300);
    const t3=setTimeout(()=>setPhase(3), 1900);
    const t4=setTimeout(()=>onDone(), 2300);
    return ()=>[t0,t1,t2,t3,t4].forEach(clearTimeout);
  },[]);

  return (
    <div style={{
      position:'fixed',inset:0,bottom:'-50px',paddingBottom:'50px',zIndex:100,
      background:'linear-gradient(160deg,#1A0A0A 0%,#0D0505 55%,#1A0808 100%)',
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
          border:'1.5px solid rgba(210,43,43,0.18)',
          animation:`splashRingOut ${1.8+i*.4}s ease-out ${i*.2}s infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* App icon with spring animation */}
      <div style={{
        marginBottom:24,
        animation:phase>=1?'splashLogoIn .7s cubic-bezier(.34,1.56,.64,1) both':'none',
        filter:phase>=1?'drop-shadow(0 12px 40px rgba(0,0,0,0.6))':'none',
        borderRadius:28,
        overflow:'hidden',
        width:120,height:120,
        flexShrink:0,
      }}>
        <Logo size={120}/>
      </div>

      {/* Text */}
      <div style={{
        textAlign:'center',marginBottom:40,
        animation:phase>=1?'splashTextIn .5s ease .3s both':'none',
      }}>
        <div style={{
          color:'white',fontSize:38,fontWeight:800,
          fontFamily:F,letterSpacing:'-1.5px',lineHeight:1,
        }}>Calor<span style={{color:'#D22B2B'}}>ú</span></div>
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
            background:'linear-gradient(90deg,#D22B2B,#F4C430)',
            width:`${barW}%`,
            transition:'width 1.1s cubic-bezier(.25,.46,.45,.94)',
            boxShadow:'0 0 10px rgba(210,43,43,0.5)',
          }}/>
        </div>
      )}

      {/* Green accent dot */}
      <div style={{
        position:'absolute',bottom:60,
        display:'flex',gap:7,
        animation:phase>=1?'splashTextIn .4s ease .5s both':'none',
      }}>
        {['#D22B2B','#F4C430','rgba(255,255,255,0.15)'].map((bg,i)=>(
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
  const totalSteps=4;

  const steps=[
    // Step 0: Bienvenida + nombre
    <div key={0} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 28px',gap:24,textAlign:'center'}}>
      <Logo size={100}/>
      <div>
        <div style={{fontSize:28,fontWeight:800,color:C.text,fontFamily:F,letterSpacing:'-1px',lineHeight:1.2}}>Bienvenido a Calor<span style={{color:'#D22B2B'}}>ú</span></div>
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
              background:perfil.sexo===v?'#007AFF':C.surfaceAlt,
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
      {(()=>{
        const tP=calcTDEE(perfil), mP=calcMetas(tP,obj,parseFloat(perfil.peso)||70);
        const cols={bajar:'#FF3B30',mantener:'#007AFF',recomp:'#AF52DE',subir:'#34C759'};
        const col=cols[obj]||'#007AFF';
        return(
          <div style={{background:'linear-gradient(135deg,#1A2C22,#0D1710)',borderRadius:20,padding:'16px'}}>
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
      <button onClick={()=>setStep(3)} style={{
        padding:'16px',borderRadius:18,border:'none',
        background:'#1C1C1E',
        color:'white',fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
      }}>Ver mi plan →</button>
    </div>,

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
      const cols={bajar:'#FF3B30',mantener:'#007AFF',recomp:'#AF52DE',subir:'#34C759'};
      const acc=cols[obj]||'#007AFF';
      const msgs={
        bajar:`En ~${semanas} semanas podrías llegar a ${pesoFuturo} kg`,
        subir:`En ~${semanas} semanas podrías ganar 3 kg de músculo`,
        mantener:'Mantendrás tu peso actual con salud',
        recomp:'Cambiarás grasa por músculo en 8–12 semanas',
      };
      return(
        <div key={3} style={{padding:'28px 24px',display:'flex',flexDirection:'column',gap:20}}>
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
          {/* Compromiso */}
          <div style={{background:'#F8F8F8',borderRadius:20,padding:'16px'}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10,fontFamily:F}}>Calorú te ayuda a lograrlo con:</div>
            {['📊 Seguimiento diario de tus macros','🔥 Racha para que no pierdas el hábito','🤖 Consejos personalizados con IA','⚖️ Historial de peso para ver tu progreso'].map((t,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:12,color:C.text,fontFamily:F}}>{t}</div>
            ))}
          </div>
          <button onClick={()=>onDone({nombre:nombre.trim(),perfil,obj})} style={{
            padding:'17px',borderRadius:18,border:'none',
            background:'#1C1C1E',color:'white',
            fontSize:16,fontWeight:800,fontFamily:F,cursor:'pointer',
            boxShadow:'0 8px 24px rgba(0,0,0,0.3)',
          }}>¡Empezar mi transformación! 🚀</button>
        </div>
      );
    })(),
  ];

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:F,overflowY:'auto'}}>
      {/* Safe area + progress bar */}
      <div style={{paddingTop:'env(safe-area-inset-top, 0px)',background:C.bg}}>
        <div style={{height:3,background:C.border}}>
          <div style={{height:'100%',width:`${(step+1)/totalSteps*100}%`,background:'#1C1C1E',transition:'width .4s ease'}}/>
        </div>
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
  const [barcode,  setBarcode] = useState('');
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
        /* ── Detectar alérgenos desde OpenFoodFacts ── */
        const offAllergenTags = [
          ...(p.allergens_tags||[]),
          ...(p.traces_tags||[]),
        ].map(t=>t.toLowerCase());
        // Mapear tags OFF → claves internas
        const detectedAllergens = [...new Set(
          offAllergenTags
            .map(t => OFF_ALLERGEN_MAP[t])
            .filter(Boolean)
        )];
        // Si OFF no tiene allergens_tags, detectar por ingredientes
        const allergensFromIngredients = detectedAllergens.length === 0
          ? detectAllergensFromIngredients(offIngred)
          : [];
        const offLabels   = (p.labels_tags||[]).map(l=>l.toLowerCase());
        const offIngred   = (p.ingredients_text_es||p.ingredients_text||'').toLowerCase();
        const offCats     = (p.categories_tags||[]).join(' ').toLowerCase();
        const NON_VEGAN_INGR = [
          'leche','lácteos','mantequilla','crema','queso','yogur','nata','suero',
          'caseína','lactosa','lactosuero','proteína de leche',
          'huevo','huevos','yema','clara de huevo',
          'carne','pollo','vacuno','cerdo','pavo','cordero','salmón','atún',
          'pescado','jamón','tocino','bacon','chorizo','longaniza','cecina','anchoa',
          'miel','gelatina','colágeno',
          'milk','egg','eggs','meat','chicken','beef','pork','fish','tuna','salmon',
          'honey','gelatin','whey','casein','lactose','butter','cream','cheese',
          'lard','anchovy','prawn','shrimp',
        ];
        let veganStatus = null; // null = sin datos suficientes
        if(offLabels.includes('en:vegan')||offLabels.includes('en:vegan-status-vegan')) {
          veganStatus = true;
        } else if(offLabels.some(l=>l.includes('non-vegan')||l.includes('no-vegan'))) {
          veganStatus = false;
        } else if(offIngred.length > 10) {
          // Tenemos ingredientes — buscar palabras clave
          if(NON_VEGAN_INGR.some(kw=>offIngred.includes(kw))) {
            veganStatus = false;
          } else if(offCats.match(/dairi|meat|seafood|egg|poultry|fish|pork|beef|chicken|milk/)) {
            veganStatus = false;
          } else {
            veganStatus = true; // ingredientes presentes, sin señales animales
          }
        } else if(offCats.match(/dairi|meat|seafood|egg|poultry|fish|pork|beef|chicken|milk/)) {
          veganStatus = false;
        }
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
          // Campos veganos
          vegan: veganStatus,
          ingredients: offIngred.slice(0,300)||null,
          offLabels: offLabels.slice(0,10),
          // Alérgenos detectados
          detectedAllergens: detectedAllergens.length > 0 ? detectedAllergens : allergensFromIngredients,
          traceAllergens: [...new Set((p.traces_tags||[]).map(t=>OFF_ALLERGEN_MAP[t.toLowerCase()]).filter(Boolean))],
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
          <div style={{padding:'8px 0 8px',animation:'fadeUp .25s ease'}}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:36,marginBottom:8}}>😕</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>No se encontró el producto</div>
              <div style={{fontSize:12,color:C.textSec,lineHeight:1.5,marginBottom:14}}>{errMsg}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="tap" onClick={retry} style={{flex:1,padding:'12px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.text,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>🔄 Reintentar</button>
              <button className="tap" onClick={()=>setStatus('manual')} style={{flex:1,padding:'12px',borderRadius:16,border:'none',background:'#007AFF',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>✏️ Ingresar manual</button>
            </div>
          </div>
        )}
        {status==='manual'&&(
          <ManualEntry C={C} F={F} barcode={barcode} onBack={()=>setStatus('error')}
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
function WeeklyPlanner({C, F, allFoods, onClose, onApplyToday}) {
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
      <div style={{...modalHeaderStyle(C), gap:10}}>
        <button onClick={onClose} style={backBtnStyle(C)}>‹ Volver</button>
        <div style={{flex:1,fontSize:15,fontWeight:700,color:C.text,textAlign:'center'}}>
          {view==='plan'?'🗓️ Plan semanal':'🛒 Lista de compras'}
        </div>
        <button onClick={()=>setView(view==='plan'?'shopping':'plan')} style={{background:'#007AFF18',border:'none',padding:'6px 10px',borderRadius:12,fontSize:11,fontWeight:700,color:'#007AFF',cursor:'pointer',fontFamily:F,flexShrink:0,minHeight:44}}>
          {view==='plan'?'🛒':'🗓️'}
        </button>
      </div>

      {/* Apply today's plan — solo visible en vista plan */}
      {view==='plan'&&(()=>{
        const todayKey2=new Date().toISOString().slice(0,10);
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
                <div style={{fontSize:13,fontWeight:key===new Date().toISOString().slice(0,10)?800:700,color:key===new Date().toISOString().slice(0,10)?'#007AFF':C.textSec,textTransform:'uppercase',letterSpacing:.4}}>{label}</div>
                {key===new Date().toISOString().slice(0,10)&&<span style={{fontSize:9,fontWeight:700,background:'#007AFF',color:'white',padding:'2px 8px',borderRadius:8}}>HOY</span>}
              </div>
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

function WeeklySummary({C, F, metas, streak, onClose}) {
  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const key=d.toISOString().slice(0,10);
    const dayLog=LS.get('log_'+key,[]);
    const exs=LS.get('ex_'+key,[]);
    const s=sumLog(dayLog);
    return {
      key, label:d.toLocaleDateString('es-CL',{weekday:'short'}),
      cal:Math.round(s.cal), prot:Math.round(s.prot),
      burned:exs.reduce((t,e)=>t+e.burn,0),
      logged:dayLog.length>0,
      isToday:key===new Date().toISOString().slice(0,10),
    };
  });
  const logged  = days.filter(d=>d.logged).length;
  const onGoal  = days.filter(d=>d.cal>0&&d.cal<=metas.cal).length;
  const avgCal  = Math.round(days.filter(d=>d.cal>0).reduce((s,d)=>s+d.cal,0)/Math.max(1,logged));
  const burned  = days.reduce((s,d)=>s+d.burned,0);
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
            {icon:'💪',l:'Kcal quemadas',v:`${burned}`,c:'#007AFF'},
            {icon:'📈',l:'Racha actual',v:`${streak.days} días`,c:'#AF52DE'},
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
                <div style={{fontSize:13,fontWeight:d.isToday?700:500,color:d.isToday?'#007AFF':C.text}}>{d.label}{d.isToday?' (hoy)':''}</div>
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
   COMPARTIR PROGRESO — genera imagen canvas
═══════════════════════════════════════════════════════ */
function ShareCard({C, F, nombre, tot, metas, obj, streak, exercises, onClose}) {
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
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0"/>
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
          <polyline points={poly} fill="none" stroke="#007AFF"
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
            fill={i===validPts.length-1?'#007AFF':C.surface}
            stroke="#007AFF" strokeWidth={2}/>
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
  // Panes (base harina/agua/levadura — sin lácteos ni huevos)
  80,81,82,83,84,85,86,87,88,89,91,92,93,
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
   ASISTENTE IA NUTRICIONAL — powered by Claude
═══════════════════════════════════════════════════════ */
function AIAssistant({C, F, nombre, tot, metas, obj, log, streak, onClose}) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat'); // chat | tips
  const endRef = useRef(null);

  const objLabels={bajar:'bajar de peso',mantener:'mantener peso',recomp:'recomposición corporal',subir:'ganar masa muscular'};
  const pct = metas.cal>0?Math.round(tot.cal/metas.cal*100):0;

  const systemPrompt = `Eres Nutri, un asistente nutricional para la app Calorú, enfocada en usuarios chilenos.
Nombre del usuario: ${nombre}.
Objetivo: ${objLabels[obj]||obj}.
Hoy consumió: ${Math.round(tot.cal)} kcal (${pct}% de su meta de ${metas.cal} kcal).
Proteínas: ${Math.round(tot.prot)}g / ${metas.prot}g meta.
Carbohidratos: ${Math.round(tot.carbs)}g / ${metas.carbs}g meta.
Grasas: ${Math.round(tot.grasas)}g / ${metas.grasas}g meta.
Comidas registradas hoy: ${log.length} items.
Racha actual: ${streak.days} días.
Responde siempre en español, de forma breve y amigable (máx 3 párrafos).
Usa emojis con moderación. Sé específico con alimentos chilenos cuando puedas.
Si el usuario pregunta algo fuera de nutrición, redirige amablemente.`;

  const QUICK_PROMPTS = [
    {icon:'🍽️', text:'¿Qué debería comer ahora?'},
    {icon:'💪', text:'¿Cómo llego a mi meta de proteínas?'},
    {icon:'📊', text:'¿Cómo voy hoy con mi dieta?'},
    {icon:'🇨🇱', text:'Sugiéreme un almuerzo chileno sano'},
    {icon:'🌙', text:'¿Qué puedo cenar liviano?'},
    {icon:'🔥', text:'Consejos para mi racha'},
  ];

  useEffect(()=>{
    if(msgs.length===0){
      setMsgs([{role:'assistant',content:`¡Hola ${nombre}! 👋 Soy Nutri, tu asistente nutricional. Llevas **${Math.round(tot.cal)} kcal** hoy (${pct}% de tu meta). ¿En qué te puedo ayudar?`}]);
    }
  },[]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:'smooth'});
  },[msgs]);

  const send = async(text) => {
    const userText = text || input.trim();
    if(!userText || loading) return;
    setInput('');
    setLoading(true);

    const newMsgs = [...msgs, {role:'user', content:userText}];
    setMsgs(newMsgs);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          system: systemPrompt,
          messages: newMsgs.map(m=>({role:m.role, content:m.content})),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'No pude responder. Intenta de nuevo.';
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
        <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:36,height:36,borderRadius:12,background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🤖</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>Nutri IA</div>
            <div style={{fontSize:10,color:'#34C759',fontWeight:600}}>● En línea</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
            {m.role==='assistant'&&(
              <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,marginRight:8,alignSelf:'flex-end'}}>🤖</div>
            )}
            <div style={{
              maxWidth:'80%',padding:'10px 14px',borderRadius:m.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
              background:m.role==='user'?'#007AFF':C.surface,
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
            <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#007AFF,#5856D6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:'18px 18px 18px 4px',padding:'12px 16px',display:'flex',gap:5}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:7,height:7,borderRadius:'50%',background:C.textMuted,animation:`bounce .8s ease ${i*0.15}s infinite`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

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
          background:input.trim()&&!loading?'#007AFF':'#C7C7CC',
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
  {id:505,nombre:"Reineta al horno",           marca:"Natural",     cat:"Pescados",   porcion:150, cal:180, prot:25,  carbs:0,   grasas:8,   fibra:0,   azucar:0,  sodio:90,  emoji:"🐟"},
  {id:506,nombre:"Congrio colorado",           marca:"Natural",     cat:"Pescados",   porcion:150, cal:195, prot:28,  carbs:0,   grasas:9,   fibra:0,   azucar:0,  sodio:85,  emoji:"🐟"},
  {id:507,nombre:"Plateada de vacuno",         marca:"Natural",     cat:"Carnes",     porcion:150, cal:320, prot:25,  carbs:0,   grasas:24,  fibra:0,   azucar:0,  sodio:65,  emoji:"🥩"},
  {id:508,nombre:"Osobuco de vacuno",          marca:"Natural",     cat:"Carnes",     porcion:200, cal:280, prot:30,  carbs:0,   grasas:17,  fibra:0,   azucar:0,  sodio:70,  emoji:"🥩"},
  {id:509,nombre:"Chuleta de cerdo",           marca:"Natural",     cat:"Carnes",     porcion:120, cal:195, prot:26,  carbs:0,   grasas:10,  fibra:0,   azucar:0,  sodio:60,  emoji:"🥩"},
  {id:510,nombre:"Atún al natural lata",       marca:"Genérico",    cat:"Pescados",   porcion:85,  cal:100, prot:22,  carbs:0,   grasas:1,   fibra:0,   azucar:0,  sodio:310, emoji:"🐟"},
  {id:511,nombre:"Edamame cocido",             marca:"Natural",     cat:"Legumbres",  porcion:100, cal:121, prot:11,  carbs:10,  grasas:5,   fibra:5,   azucar:2,  sodio:6,   emoji:"🫘"},
  {id:512,nombre:"Granola sin azúcar",         marca:"Genérico",    cat:"Cereales",   porcion:45,  cal:180, prot:5,   carbs:25,  grasas:7,   fibra:4,   azucar:2,  sodio:15,  emoji:"🌾"},
  {id:513,nombre:"Arroz integral cocido",      marca:"Genérico",    cat:"Granos",     porcion:200, cal:216, prot:5,   carbs:45,  grasas:1.8, fibra:3.5, azucar:0,  sodio:10,  emoji:"🍚"},
  {id:514,nombre:"Batata / Camote cocido",     marca:"Natural",     cat:"Verduras",   porcion:130, cal:112, prot:2,   carbs:26,  grasas:0.1, fibra:3.8, azucar:5.4,sodio:72,  emoji:"🍠"},
  {id:515,nombre:"Kéfir natural",              marca:"Genérico",    cat:"Lácteos",    porcion:250, cal:150, prot:10,  carbs:12,  grasas:5,   fibra:0,   azucar:8,  sodio:90,  emoji:"🥛"},

];

function RestaurantEstimator({C,F,meal,onAdd,onClose}){
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
            <button key={k} className="tap" onClick={()=>setSize(k)} style={{flex:1,padding:'8px 4px',borderRadius:12,border:`1.5px solid ${size===k?'#007AFF':C.border}`,background:size===k?'#007AFF18':C.surfaceAlt,color:size===k?'#007AFF':C.textSec,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:F}}>
              {l}
            </button>
          ))}
        </div>
        {/* Category tabs */}
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:12,overflowX:'auto',scrollbarWidth:'none'}}>
          {QUICK_ESTIMATES.map((cat,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{flexShrink:0,padding:'7px 12px',border:'none',background:'none',cursor:'pointer',fontFamily:F,fontSize:11,fontWeight:700,color:tab===i?'#007AFF':C.textSec,borderBottom:`2px solid ${tab===i?'#007AFF':'transparent'}`,whiteSpace:'nowrap'}}>
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
                  <div style={{fontSize:15,fontWeight:800,color:'#007AFF'}}>{cal}</div>
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
function ManualEntry({C, F, barcode, onSave, onBack}) {
  const [food, setFood] = useState({
    nombre:'', marca:'', porcion:100,
    cal:'', prot:'', carbs:'', grasas:'', fibra:'', azucar:'', sodio:'',
  });
  const valid = food.nombre.trim().length>0 && +food.cal>0;

  return(
    <div style={{padding:'8px 0',animation:'fadeUp .25s ease'}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>✏️ Agregar manualmente</div>
      {barcode&&<div style={{fontSize:11,color:C.textMuted,marginBottom:10,padding:'4px 10px',background:C.surfaceAlt,borderRadius:8,display:'inline-block'}}>📷 Código: {barcode}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        <div style={{gridColumn:'1/-1'}}>
          <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:4}}>Nombre *</div>
          <input value={food.nombre} onChange={e=>setFood({...food,nombre:e.target.value})}
            placeholder="Ej: Galletas de avena"
            style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${food.nombre?'#007AFF':C.border}`,borderRadius:12,fontSize:14,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
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
              style={{width:'100%',padding:'10px 12px',border:`1.5px solid ${req&&!food[k]?C.border:food[k]?'#007AFF':C.border}`,borderRadius:12,fontSize:15,fontWeight:700,fontFamily:F,color:C.text,background:C.surfaceAlt,outline:'none'}}/>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="tap" onClick={onBack} style={{flex:1,padding:'12px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>← Volver</button>
        <button className="tap" onClick={()=>{
          if(!valid) return;
          onSave({
            id:Date.now()+Math.random(),
            nombre:food.nombre.trim(),
            marca:food.marca.trim()||'Manual',
            cat:'Escaneado', porcion:+food.porcion||100,
            cal:+food.cal, prot:+food.prot||0, carbs:+food.carbs||0,
            grasas:+food.grasas||0, fibra:+food.fibra||0,
            azucar:food.azucar!==''?+food.azucar:null,
            sodio:food.sodio!==''?+food.sodio:null,
            emoji:'📦', barcode,
          });
        }} style={{flex:2,padding:'12px',borderRadius:16,border:'none',background:valid?'#007AFF':'#C7C7CC',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
          ✅ Agregar al diario
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
    const sd = new Date().toISOString().slice(0,10);
    LS.set('challenge21', {startDate:sd, completedDays:[]});
    setStartDate(sd); setActive(true); haptic('goal');
  };
  const reset = () => { LS.set('challenge21',null); setActive(false); setStartDate(null); };

  const days = active ? Array.from({length:21},(_,i)=>{
    const d = new Date(startDate);
    d.setDate(d.getDate()+i);
    const key = d.toISOString().slice(0,10);
    const today = new Date().toISOString().slice(0,10);
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
   MODAL DETALLE CON AJUSTE DE GRAMOS
═══════════════════════════════════════════════════════ */
function ModalDetalle({food, meal, C, F, onClose, onAdd, onFav, isFav}) {
  const [grams, setGrams] = useState(food.porcion || 100);
  const [mode, setMode] = useState(()=>LS.get('prefMode','porcion')); // 'porcion' | 'gramos'

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
                  border:`1.5px solid ${grams===g?'#007AFF':C.border}`,
                  background:grams===g?'#007AFF14':C.surfaceAlt,
                  color:grams===g?'#007AFF':C.textSec,
                  fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
                  transition:'all .15s',textAlign:'center',
                }}>{g}g</button>
              ))}
            </div>
            {/* Portion equivalence hint */}
            {getPortionHint(grams)&&(
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,padding:'6px 10px',background:'#007AFF10',borderRadius:10,border:'1px solid #007AFF20'}}>
                <span style={{fontSize:14}}>⚖️</span>
                <span style={{fontSize:12,color:'#007AFF',fontWeight:700}}>≈ {getPortionHint(grams)}</span>
                <span style={{fontSize:11,color:C.textMuted}}>en volumen</span>
              </div>
            )}

            {/* Portion reference chips */}
            <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
              {PORTION_REFS.slice(0,8).map(r=>(
                <button key={r.g} className="tap" onClick={()=>setGrams(r.g)} style={{
                  padding:'4px 9px',borderRadius:9,
                  border:`1px solid ${Math.abs(grams-r.g)<=2?'#007AFF':C.border}`,
                  background:Math.abs(grams-r.g)<=2?'#007AFF':C.surfaceAlt,
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
              <button onClick={()=>setGrams(grams+5)} style={{width:38,height:38,borderRadius:11,border:'none',background:'#007AFF',fontSize:18,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>+</button>
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

        {/* Gram info banner with equivalences */}
        <div style={{background:'#007AFF10',borderRadius:13,padding:'10px 14px',marginBottom:16,border:'1px solid #007AFF20'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:getPortionHint(grams)?5:0}}>
            <span style={{fontSize:12,color:C.textSec,fontWeight:600}}>
              {mode==='porcion'?`1 porción = ${food.porcion||100}g`:`${grams}g seleccionados`}
            </span>
            <span style={{fontSize:13,fontWeight:800,color:'#007AFF'}}>{v(food.cal)} kcal</span>
          </div>
          {getPortionHint(grams)&&(
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:11,color:'#007AFF',fontWeight:700}}>≈ {getPortionHint(grams)}</span>
              <span style={{fontSize:10,color:C.textMuted}}>en volumen</span>
            </div>
          )}
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
• Datos de salud: peso corporal, medidas, objetivos calóricos y registros de alimentación que tú mismo ingresas.
• Datos técnicos: tipo de dispositivo y errores de la app para mejorar la experiencia.

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
                <button onClick={()=>{setResetMode(true);setError('');setMsg('');}} style={{background:'none',border:'none',fontSize:12,color:'#007AFF',cursor:'pointer',fontFamily:F,fontWeight:500,padding:'4px 0'}}>
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
        React.createElement('button',{onClick:()=>window.location.reload(),style:{padding:'13px 28px',borderRadius:16,border:'none',background:'#007AFF',color:'white',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10}},'Recargar app'),
        React.createElement('button',{onClick:()=>{localStorage.clear();window.location.reload();},style:{padding:'11px 24px',borderRadius:14,border:'1px solid #E5E5EA',background:'white',color:'#FF3B30',fontSize:13,fontWeight:600,cursor:'pointer'}},'Borrar datos y reiniciar')
      );
    }
    return this.props.children;
  }
}


function AppCore() {
  const [splash,setSplash]     = useState(true);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [authChecked, setAuthChecked]  = useState(false);
  const [syncStatus, setSyncStatus]    = useState('idle');
  const [restoringData, setRestoringData] = useState(false);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const syncTimer = useRef(null);

  useEffect(()=>{if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{});}},[]);

  /* ── Detector de conexión ── */
  useEffect(()=>{
    const on  = ()=>setIsOnline(true);
    const off = ()=>setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return ()=>{ window.removeEventListener('online',on); window.removeEventListener('offline',off); };
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
  const [perfil,setPerfil]     = useState(()=>LS.get('perfil',{peso:70,altura:170,edad:25,sexo:'M',act:'1.55'}));
  const [customMetas,setCustomMetas] = useState(()=>LS.get('customMetas',null));
  const [userAllergens,setUserAllergens] = useState(()=>LS.get('allergens',[]));
  const [veganMode,setVeganMode] = useState(()=>LS.get('veganMode',false));
  const [weightHistory,setWeightHistory] = useState(()=>LS.get('weightHistory',[]));
  const [obj,setObj]           = useState(()=>LS.get('obj','mantener'));
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
  const [meal,setMeal]         = useState('Desayuno');
  const [q,setQ]               = useState('');
  const [cat,setCat]           = useState('Todas');
  const [recent,setRecent]     = useState(()=>LS.get('recentFoods',[]));
  const [weights,setWeights]   = useState(()=>LS.get('weights',[]));
  const [newWeight,setNewWeight] = useState('');
  const [streak,setStreak]     = useState(()=>LS.get('streak',{days:0,last:''}));
  const [expanded,setExpand]        = useState(null);
  const [editingItem,setEditingItem] = useState(null); // uid of item being edited
  const [searchSort,setSearchSort]  = useState('default');
  const [searchMaxCal,setSearchMaxCal] = useState(0);
  const [showFilter,setShowFilter]  = useState(false);
  const [showHistory,setShowHistory] = useState(false);
  const [historyDay,setHistoryDay]   = useState(null);
  const [showWeekly,setShowWeekly]   = useState(false);
  const [showShare,setShowShare]     = useState(false);
  const [avatar,setAvatar]           = useState(()=>LS.get('avatar','🧑'));
  const [showAvatarPicker,setShowAvatarPicker] = useState(false);
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
  const [notifEnabled,setNotifEnabled] = useState(()=>LS.get('notif',false));
  const [lastPct,setLastPct]       = useState(0);
  const [newAchiev,setNewAchiev]   = useState(null);
  const [showAI,setShowAI]         = useState(false);
  const [showRestaurant,setShowRestaurant] = useState(false);
  const [showChallenge,setShowChallenge]   = useState(false);
  const [showAllLogros,setShowAllLogros]   = useState(false);
  const [showCustom,setShowCustom] = useState(false);
  const [showScanner,setShowScanner] = useState(false);
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
  useEffect(()=>{LS.set('perfil',perfil);},[perfil]);
  useEffect(()=>{LS.set('obj',obj);},[obj]);
  useEffect(()=>{LS.set('dark',dark);},[dark]);
  useEffect(()=>{LS.set('nombre',nombre);},[nombre]);
  useEffect(()=>{LS.set('recentFoods',recent);},[recent]);
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
  /* ── recordatorios inteligentes ── */
  useEffect(()=>{
    if(!notifEnabled) return;
    const check=()=>{
      const h=new Date().getHours(),m=new Date().getMinutes();
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
  useEffect(()=>{LS.set('weightHistory',weightHistory);},[weightHistory]);

  /* ── Sync bidireccional al hacer login ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    (async()=>{
      setRestoringData(true);
      setSyncStatus('syncing');
      try {
        // 1. Leer qué hay en Supabase
        const remote = await restoreFromSupabase(supabaseUser.id);

        // 2. Leer qué hay localmente
        const localNombre    = LS.get('nombre','');
        const localOnboarded = LS.get('onboarded', false);
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

        // 4. Si este dispositivo tiene datos que Supabase NO tiene → subir
        const needsPush = !remote.profile?.nombre && localOnboarded && localNombre.length > 0;
        if(needsPush){
          await syncProfile(supabaseUser.id, { nombre:localNombre, perfil:localPerfil, obj:localObj });
          await syncSettings(supabaseUser.id, {
            allergens:userAllergens, veganMode, darkMode:dark,
            notifEnabled, streak:LS.get('streak',{}), challenge21:LS.get('challenge21',null),
          });
          for(let i=0;i<30;i++){
            const d=new Date(); d.setDate(d.getDate()-i);
            const key=d.toISOString().slice(0,10);
            const dl=LS.get('log_'+key,[]);
            const da=LS.get('agua_'+key,0);
            const de=LS.get('ex_'+key,[]);
            if(dl.length||da||de.length) await syncDay(supabaseUser.id, key, dl, da, de);
          }
          if(localWeight.length) await syncWeight(supabaseUser.id, localWeight);
        }

        setSyncStatus('done');
        setTimeout(()=>setSyncStatus('idle'),2000);
      } catch(e){
        console.error('Sync error:',e);
        setSyncStatus('error');
        setToast('⚠️ Error de sincronización. Revisa tu conexión.');
      } finally {
        setRestoringData(false);
      }
    })();
  },[supabaseUser?.id]);


  /* ── Sync automático: log del día ── */
  useEffect(()=>{
    if(!supabaseUser) return;
    if(syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(()=>{
      setSyncStatus('syncing');
      syncDay(supabaseUser.id, todayKey(), log, agua, exercises)
        .then(()=>{ setSyncStatus('done'); setTimeout(()=>setSyncStatus('idle'),1500); })
        .catch(()=>setSyncStatus('error'));
    }, 2000); // debounce 2s
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

  /* ── daily AI insight (se genera una vez por día) ── */
  useEffect(()=>{
    const insightKey='insight_'+todayKey();
    if(LS.get(insightKey,'')) return; // ya generado hoy
    if(!nombre||log.length===0) return; // esperar datos reales
    const generate=async()=>{
      setInsightLoading(true);
      try{
        const prevDay=new Date(); prevDay.setDate(prevDay.getDate()-1);
        const prevKey=prevDay.toISOString().slice(0,10);
        const prevLog=LS.get('log_'+prevKey,[]);
        const prevProt=Math.round(sumLog(prevLog).prot);
        const prompt=`Eres un nutricionista chileno amigable. Genera UN SOLO insight motivacional personalizado para ${nombre} en máximo 2 oraciones. Datos de hoy: ${Math.round(tot.cal)} kcal consumidas de ${metas.cal} kcal meta, ${Math.round(tot.prot)}g proteína de ${metas.prot}g meta, racha de ${streak.days} días. ${prevProt>0?`Ayer consumió ${prevProt}g de proteína.`:''} Objetivo: ${obj==='bajar'?'bajar de peso':obj==='subir'?'ganar músculo':obj==='recomp'?'recomposición corporal':'mantener peso'}. Sé específico con sus números, usa emojis y un lenguaje cercano. Solo devuelve el insight, sin saludos ni explicaciones extra.`;
        const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:120,messages:[{role:'user',content:prompt}]})});
        const d=await r.json();
        const text=d.content?.[0]?.text||'';
        if(text){ setDailyInsight(text); LS.set(insightKey,text); }
      }catch(e){}
      setInsightLoading(false);
    };
    generate();
  },[log.length,nombre,streak.days]);
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
      const key=d.toISOString().slice(0,10);
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
      const yKey = yesterday.toISOString().slice(0,10);

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
        const dayBefore = new Date(today);
        dayBefore.setDate(dayBefore.getDate()-1);
        const dayBeforeKey = dayBefore.toISOString().slice(0,10);
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

  /* ── toast auto-dismiss ── */
  useEffect(()=>{
    if(toast){const t=setTimeout(()=>setToast(''),3200);return ()=>clearTimeout(t);}
  },[toast]);

  /* ── computed ── */
  const tdee   = calcTDEE(perfil);
  const autoMetas = calcMetas(tdee, obj, parseFloat(perfil.peso)||70);
  const metas     = customMetas || autoMetas;
  const tot    = useMemo(()=>sumLog(log),[log]);
  const pct    = metas.cal>0?tot.cal/metas.cal:0;
  const tips   = getTips(tot, metas, obj, agua, pct, exercises, streak);
  const saludScore = calcSaludScore(tot, metas, agua, exercises, streak);

  const MACRO_DEFS = [
    {key:'cal',    label:'Calorías',      icon:'🔥', color:'#007AFF',  meta:metas.cal,   unit:'kcal'},
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

  /* ── Goal celebration ── */
  useEffect(()=>{
    if(pct>=1 && lastPct<1 && tot.cal>0){
      setConfetti(true);
      haptic('goal');
      setTimeout(()=>setConfetti(false), 3000);
    }
    setLastPct(pct);
  },[pct]);

  /* ── Achievement checker (runs after pct is defined) ── */
  useEffect(()=>{
    const prev = LS.get('achievements',{});
    const checks = {
      first_log:   {done: log.length>0,          label:'¡Primer registro! 🌱'},
      water_goal:  {done: agua>=8,                label:'¡Hidratación perfecta! 💧'},
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
      const key=d.toISOString().slice(0,10);
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
  const fastElapsed = fastStart ? Math.floor((fastNow-fastStart)/3600000) : 0;
  const fastPct = fastGoal>0 ? Math.min(fastElapsed/fastGoal,1) : 0;
  const fastDone = fastElapsed >= fastGoal;

  const foods  = useMemo(()=>allFoods.filter(a=>{
    const s=q.toLowerCase();
    const matchText=(a.nombre.toLowerCase().includes(s)||a.marca.toLowerCase().includes(s));
    const matchCat=(cat==='Todas'||a.cat===cat);
    const matchVegan=!veganMode||isVegan(a);
    const matchAllergens=userAllergens.length===0||
      !getFoodAllergens(a).some(al=>userAllergens.includes(al));
    return matchText&&matchCat&&matchVegan&&matchAllergens;
  }),[q,cat,veganMode,userAllergens]);

  /* ── actions ── */
  const toggleFav = (food) => {
    const isFav=favorites.some(f=>f.id===food.id);
    if(isFav) setFavorites(favorites.filter(f=>f.id!==food.id));
    else setFavorites([...favorites,food].slice(0,20));
  };

  const [addFlash, setAddFlash] = useState(false);
  const addFood = useCallback((a)=>{
    const ex=log.find(r=>r.id===a.id&&r.comida===meal&&r.grams===(a.grams||null));
    if(ex) setLog(log.map(r=>r.uid===ex.uid?{...r,qty:r.qty+1}:r));
    else   setLog([...log,{...a,comida:meal,qty:1,uid:Date.now()+Math.random(),grams:a.grams||null}]);
    setRecent(prev=>{const f=prev.filter(x=>x.id!==a.id);return [a,...f].slice(0,8);});
    /* Auto-save scanned/manual products to "Agregados por ti" */
    if((a.cat==='Escaneado'||a.barcode||a.marca==='Manual'||a.marca==='Estimado')){
      setCustomFoods(prev=>{
        if(prev.find(f=>f.id===a.id||f.barcode===a.barcode)) return prev;
        const saved={...a,savedAt:Date.now(),origen:'escaneado'};
        return [...prev, saved];
      });
    }
    setDetail(null);
    haptic('add');
    setToast(`✓ ${a.nombre.split(' ').slice(0,3).join(' ')} agregado`);
    setAddFlash(true); setTimeout(()=>setAddFlash(false),600);
  },[log,meal,customFoods]);

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
      <button onClick={onInc} style={{width:30,height:30,borderRadius:9,border:'none',background:'#007AFF',color:'white',fontSize:16,cursor:'pointer',fontFamily:F,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
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
        background:'#007AFF',color:'white',
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
      background:'linear-gradient(160deg,#1A0A0A 0%,#0D0505 55%,#1A0808 100%)',
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
          background:'linear-gradient(90deg,#D22B2B,#F4C430)',
          animation:'splashBarFill 1.5s ease infinite alternate',
        }}/>
      </div>
    </div>
  );

  if(!onboarded) return <Onboarding onDone={({nombre:n,perfil:p,obj:o})=>{
    setNombre(n); setPerfil(p); setObj(o);
    setOnboarded(true); LS.set('onboarded',true);
    LS.set('nombre',n); LS.set('perfil',p); LS.set('obj',o);
  }}/>;

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
      {showWeekly&&<WeeklySummary C={C} F={F} metas={metas} streak={streak} onClose={()=>setShowWeekly(false)}/>}

      {/* ══ SHARE CARD ══ */}
      {showShare&&<ShareCard C={C} F={F} nombre={nombre} tot={tot} metas={metas} obj={obj} streak={streak} exercises={exercises} onClose={()=>setShowShare(false)}/>}

      {/* ══ HISTORY MODAL ══ */}
      {showHistory&&(
        <div style={{position:'fixed',inset:0,background:C.bg,zIndex:80,display:'flex',flexDirection:'column',animation:'fadeUp .3s ease'}}>
          <div style={modalHeaderStyle(C)}>
            <button onClick={()=>setShowHistory(false)} style={backBtnStyle(C)}>‹ Volver</button>
            <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,textAlign:'center'}}>📅 Historial</div>
            <div style={{minWidth:80}}/>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:'12px 16px'}}>
            {Array.from({length:14},(_,i)=>{
              const d=new Date(); d.setDate(d.getDate()-1-i);
              const key=d.toISOString().slice(0,10);
              const dayLog=LS.get('log_'+key,[]);
              const cal=Math.round(sumLog(dayLog).cal);
              const note=LS.get('note_'+key,'');
              const exs=LS.get('ex_'+key,[]);
              const isSel=historyDay===key;
              return(
                <div key={key} style={{marginBottom:8}}>
                  <div onClick={()=>setHistoryDay(isSel?null:key)} style={{
                    background:C.surface,borderRadius:18,padding:'14px 16px',
                    border:`1px solid ${isSel?'#007AFF':C.border}`,cursor:'pointer',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:44,height:44,borderRadius:13,background:cal>0?'#007AFF18':'#F2F2F7',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <div style={{fontSize:14,fontWeight:800,color:cal>0?'#007AFF':C.textMuted}}>{d.getDate()}</div>
                        <div style={{fontSize:8,color:cal>0?'#007AFF':C.textMuted,fontWeight:600,textTransform:'uppercase'}}>{d.toLocaleDateString('es-CL',{month:'short'})}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text,textTransform:'capitalize'}}>{d.toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}</div>
                        <div style={{display:'flex',gap:8,marginTop:4}}>
                          {cal>0?<span style={{fontSize:11,fontWeight:700,color:'#007AFF'}}>{cal} kcal</span>:<span style={{fontSize:11,color:C.textMuted}}>Sin registro</span>}
                          {exs.length>0&&<span style={{fontSize:11,color:'#34C759',fontWeight:600}}>💪 {exs.length} ej.</span>}
                          {note&&<span style={{fontSize:11,color:C.textSec}}>📝</span>}
                        </div>
                      </div>
                      <div style={{fontSize:14,color:C.textMuted,transform:isSel?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</div>
                    </div>
                    {isSel&&dayLog.length>0&&(
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
                        <button className="tap" onClick={()=>{
                          setLog(dayLog.map(it=>({...it,uid:Date.now()+Math.random()})));
                          setShowHistory(false);
                          haptic('success');
                          setToast('📋 Comidas copiadas al día de hoy');
                        }} style={{width:'100%',marginTop:12,padding:'11px',borderRadius:14,border:'none',background:'#007AFF',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                          📋 Copiar estas comidas a hoy
                        </button>
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

      {showAI&&<AIAssistant C={C} F={F} nombre={nombre} tot={tot} metas={metas} obj={obj} log={log} streak={streak} onClose={()=>setShowAI(false)}/>}
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
                      border:`2px solid ${avatar===e?'#007AFF':C.border}`,
                      background:avatar===e?'#007AFF18':C.surfaceAlt,
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

      {showRestaurant&&<RestaurantEstimator C={C} F={F} meal={meal} onClose={()=>setShowRestaurant(false)} onAdd={food=>{addFood(food);setShowRestaurant(false);}}/>}

      {showChallenge&&<Challenge21 C={C} F={F} streak={streak} log={log} metas={metas} onClose={()=>setShowChallenge(false)}/>}

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
            <div style={{display:'flex',gap:6}}>
              <button className="tap" onClick={()=>setShowAI(true)} style={{
                width:34,height:34,borderRadius:11,border:`1px solid ${C.border}`,
                background:'#007AFF18',color:'#007AFF',fontSize:16,cursor:'pointer',
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
                border:`1px solid ${autoTheme?'#007AFF':C.border}`,
                background:autoTheme?'#007AFF18':C.surfaceAlt,color:C.text,
                fontSize:15,cursor:'pointer',fontFamily:F,
                display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                position:'relative',
              }}>
                {dark?'☀️':'🌙'}
                {autoTheme&&<div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:'#007AFF'}}/>}
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

          {/* ── HERO: SALUD SCORE ── */}
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
                {l:'Cal',pts:(()=>{if(!metas.cal)return 0;const cp=tot.cal/metas.cal;return cp>=0.85&&cp<=1.08?30:cp>=0.65?18:cp>0?8:0;})(),max:30,c:'#007AFF'},
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

          {/* ── COMPARAR CON AYER ── */}
          {(()=>{
            const prev=new Date(); prev.setDate(prev.getDate()-1);
            const prevKey=prev.toISOString().slice(0,10);
            const summary=LS.get('summary_'+prevKey,null);
            if(!summary||summary.items===0) return null;
            const diff=Math.round(tot.cal)-summary.cal;
            return(
              <div style={{background:C.surface,borderRadius:18,padding:'12px 16px',marginBottom:12,border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>📊 Vs ayer</div>
                  <button className="tap" onClick={()=>setShowHistory(true)} style={{fontSize:11,color:'#007AFF',background:'none',border:'none',cursor:'pointer',fontFamily:F,fontWeight:600}}>Historial →</button>
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
                background:'#007AFF',color:'white',
                fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:F,
                boxShadow:'0 4px 12px rgba(0,122,255,0.3)',
              }}>Agregar</button>
            </div>
          )}

          {/* ── 4 MACRO CARDS ── */}
          <div className="s2" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:12}}>
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
            border:`1.5px solid ${(searchSort!=='default'||searchMaxCal>0)?'#007AFF':C.border}`,
            background:(searchSort!=='default'||searchMaxCal>0)?'#007AFF18':C.surfaceAlt,
            color:(searchSort!=='default'||searchMaxCal>0)?'#007AFF':C.textSec,
            fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F,
            display:'flex',alignItems:'center',gap:6,
          }}>⚙️ Filtros {searchSort!=='default'||searchMaxCal>0?'•':''}</button>
          {showFilter&&(
            <div style={{background:C.surface,borderRadius:16,padding:'12px 14px',marginBottom:10,border:`1px solid ${C.border}`,animation:'fadeUp .2s ease'}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Ordenar por</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
                {[{v:'default',l:'Relevancia'},{v:'cal_asc',l:'Menos kcal'},{v:'cal_desc',l:'Más kcal'},{v:'prot_desc',l:'Más proteína'},{v:'name',l:'A-Z'}].map(({v,l})=>(
                  <button key={v} className="tap" onClick={()=>setSearchSort(v)} style={{padding:'6px 12px',borderRadius:12,border:'none',background:searchSort===v?'#007AFF':C.surfaceAlt,color:searchSort===v?'white':C.textSec,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F}}>{l}</button>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Máx. calorías</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[0,100,200,300,500].map(v=>(
                  <button key={v} className="tap" onClick={()=>setSearchMaxCal(v)} style={{padding:'6px 12px',borderRadius:12,border:'none',background:searchMaxCal===v?'#007AFF':C.surfaceAlt,color:searchMaxCal===v?'white':C.textSec,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:F}}>{v===0?'Sin límite':'≤'+v}</button>
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
                  <button className="tap" onClick={()=>setShowCustom(true)} style={{padding:'10px 16px',borderRadius:14,border:'none',background:'#007AFF',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>✏️ Crear manualmente</button>
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
                background:'#007AFF',color:'white',border:'none',
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
                    <div key={item.uid} style={{background:C.surface,borderRadius:17,marginBottom:6,boxShadow:`0 2px 8px rgba(0,0,0,${dark?.1:.05})`,borderLeft:`3px solid ${MC[m]}`,overflow:'hidden'}}>
                      {/* Main row */}
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px'}}>
                        <span style={{fontSize:22,flexShrink:0}}>{item.emoji}</span>
                        <div style={{flex:1,minWidth:0}} onClick={()=>setEditingItem(editingItem===item.uid?null:item.uid)}>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.nombre}</div>
                          <div style={{display:'flex',gap:5,marginTop:3,flexWrap:'wrap'}}>
                            <span style={{fontSize:11,fontWeight:800,color:'#007AFF'}}>{Math.round(item.cal*itemRatio(item)*item.qty)} kcal</span>
                            <span style={{fontSize:10,color:C.red,fontWeight:600}}>P:{Math.round(item.prot*itemRatio(item)*item.qty)}g</span>
                            <span style={{fontSize:10,color:C.amber,fontWeight:600}}>C:{Math.round(item.carbs*itemRatio(item)*item.qty)}g</span>
                            <span style={{fontSize:10,color:C.textMuted,fontWeight:500}}>{(item.grams||item.porcion||100)}g{getPortionHint(item.grams||item.porcion||100)?' · ≈'+getPortionHint(item.grams||item.porcion||100):''}</span>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                          <button className="tap" onClick={()=>setEditingItem(editingItem===item.uid?null:item.uid)} style={{
                            width:28,height:28,borderRadius:8,border:`1px solid ${editingItem===item.uid?'#007AFF':C.border}`,
                            background:editingItem===item.uid?'#007AFF18':C.surfaceAlt,
                            fontSize:13,cursor:'pointer',color:editingItem===item.uid?'#007AFF':C.textMuted,
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
                                  style={{flex:1,padding:'6px 8px',border:`1.5px solid #007AFF`,borderRadius:10,fontSize:14,fontWeight:700,color:C.text,background:C.surface,outline:'none',fontFamily:F,textAlign:'center'}}/>
                                <button onClick={()=>setItemGrams(item.uid,(item.grams||item.porcion||100)+10)} style={{width:28,height:28,borderRadius:8,border:'none',background:'#007AFF',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                              </div>
                            </div>
                            <div>
                              <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>Cantidad</div>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <button onClick={()=>setItemQty(item.uid,item.qty-1)} style={{width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,fontSize:14,cursor:'pointer',color:C.textSec,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                                <input type="number" value={item.qty}
                                  onChange={e=>setItemQty(item.uid,+e.target.value||0)}
                                  style={{flex:1,padding:'6px 8px',border:`1.5px solid #007AFF`,borderRadius:10,fontSize:14,fontWeight:700,color:C.text,background:C.surface,outline:'none',fontFamily:F,textAlign:'center'}}/>
                                <button onClick={()=>setItemQty(item.uid,item.qty+1)} style={{width:28,height:28,borderRadius:8,border:'none',background:'#007AFF',fontSize:14,cursor:'pointer',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                              </div>
                            </div>
                          </div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                            <span style={{fontSize:12,color:C.textSec,fontWeight:500}}>
                              Total: <strong style={{color:'#007AFF'}}>{Math.round(item.cal*itemRatio({...item,grams:item.grams||item.porcion||100})*item.qty)} kcal</strong>
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

          {/* Profile */}
          <div style={{background:C.surface,borderRadius:22,padding:'18px',marginBottom:12,boxShadow:`0 2px 14px rgba(0,0,0,${dark?.15:.07})`}}>
            {/* Avatar + nombre */}
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:18}}>
              <div style={{position:'relative'}}>
                <div style={{
                  width:72,height:72,borderRadius:22,
                  background:`linear-gradient(135deg,${C.surfaceAlt},${C.border})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:38,border:`2px solid ${C.border}`,
                }}>
                  {avatar}
                </div>
                <button className="tap" onClick={()=>setShowAvatarPicker(true)} style={{
                  position:'absolute',bottom:-4,right:-4,
                  width:26,height:26,borderRadius:8,
                  background:'#007AFF',border:'2px solid white',
                  fontSize:12,cursor:'pointer',
                  display:'flex',alignItems:'center',justifyContent:'center',color:'white',
                  boxShadow:'0 2px 8px rgba(0,122,255,0.4)',
                }}>✏️</button>
              </div>
              <div style={{flex:1}}>
                {editName?(
                  <div style={{display:'flex',gap:8}}>
                    <input value={tempName} onChange={e=>setTempName(e.target.value)}
                      autoFocus onFocus={e=>e.target.select()}
                      style={{flex:1,padding:'8px 12px',border:`1.5px solid #007AFF`,borderRadius:12,fontSize:15,fontWeight:700,color:C.text,background:C.surfaceAlt,outline:'none',fontFamily:F}}/>
                    <button className="tap" onClick={()=>{if(tempName.trim()){setNombre(tempName.trim());}setEditName(false);haptic('success');}} style={{padding:'8px 14px',borderRadius:12,border:'none',background:'#007AFF',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F}}>✓</button>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:C.text,letterSpacing:'-.3px'}}>{nombre}</div>
                    <button className="tap" onClick={()=>{setTempName(nombre);setEditName(true);}} style={{background:'none',border:'none',fontSize:12,color:'#007AFF',cursor:'pointer',fontFamily:F,fontWeight:600,padding:'2px 0',marginTop:2}}>✏️ Editar nombre</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Datos físicos</div>
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
            {/* ⚖️ Gráfico de peso */}
            <div style={{marginTop:14,background:C.surface,borderRadius:18,padding:'14px 16px',border:`1px solid ${C.border}`}}>
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
                }} style={{padding:'6px 12px',borderRadius:12,border:'none',background:'#007AFF',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F}}>
                  + Registrar hoy
                </button>
              </div>
              <WeightChart
                data={Array.from({length:30},(_,i)=>{
                  const d=new Date(); d.setDate(d.getDate()-29+i);
                  const key=d.toISOString().slice(0,10);
                  const entry=weightHistory.find(e=>e.date===key);
                  return {date:key,label:d.toLocaleDateString('es-CL',{day:'numeric',month:'short'}),w:entry?.w||null};
                })}
                C={C} F={F}
              />
            </div>

            {/* ═══ MODO VEGANO ═══ */}
            <div style={{marginTop:16}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🌱 Modo vegano</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>
                Filtra los productos no-veganos en el buscador y muestra el estado vegano de cada alimento.
              </div>
              {/* Toggle card */}
              <div style={{
                background:veganMode?'#34C75910':'#F2F2F7',
                borderRadius:18,padding:'14px 16px',
                border:`1.5px solid ${veganMode?'#34C75940':C.border}`,
                display:'flex',alignItems:'center',gap:14,
                transition:'all .25s ease',
              }}>
                <div style={{width:46,height:46,borderRadius:14,background:veganMode?'#34C75918':C.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,transition:'background .2s'}}>🌱</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.2}}>{veganMode?'Modo vegano activo':'Modo vegano desactivado'}</div>
                  <div style={{fontSize:11,color:C.textSec,marginTop:2,lineHeight:1.4}}>
                    {veganMode?'Solo ves productos 100% veganos en el buscador':'Activar para filtrar productos con origen animal'}
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  className="tap"
                  onClick={()=>{haptic('light');setVeganMode(v=>!v);}}
                  style={{
                    flexShrink:0,
                    width:51,height:31,borderRadius:16,border:'none',cursor:'pointer',
                    background:veganMode?'#34C759':'#C7C7CC',
                    position:'relative',
                    transition:'background .25s ease',
                    padding:0,
                  }}
                  aria-label="Activar modo vegano"
                >
                  <div style={{
                    position:'absolute',top:3,
                    left:veganMode?23:3,
                    width:25,height:25,borderRadius:13,
                    background:'white',
                    boxShadow:'0 2px 6px rgba(0,0,0,0.20)',
                    transition:'left .22s cubic-bezier(.34,1.56,.64,1)',
                  }}/>
                </button>
              </div>
              {veganMode&&(
                <div style={{marginTop:8,padding:'8px 12px',background:'#34C75910',borderRadius:12,border:'1px solid #34C75930',fontSize:11,color:'#34C759',fontWeight:600,lineHeight:1.5}}>
                  🌱 Filtrando productos no-veganos del buscador
                </div>
              )}
            </div>

            {/* ═══ ALERGIAS E INTOLERANCIAS ═══ */}
            <div style={{marginTop:16}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>🚫 Alergias e intolerancias</div>
              <div style={{fontSize:11,color:C.textSec,marginBottom:12,lineHeight:1.5}}>
                Los alimentos marcados se ocultarán automáticamente del buscador.
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {ALLERGENS.map(al=>{
                  const active=userAllergens.includes(al.k);
                  return(
                    <button key={al.k} className="tap" onClick={()=>{
                      haptic('light');
                      setUserAllergens(prev=>active?prev.filter(x=>x!==al.k):[...prev,al.k]);
                    }} style={{
                      display:'flex',alignItems:'center',gap:6,
                      padding:'8px 14px',borderRadius:20,cursor:'pointer',fontFamily:F,
                      border:`1.5px solid ${active?al.color:C.border}`,
                      background:active?al.color+'18':C.surfaceAlt,
                      transition:'all .18s ease',
                    }}>
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
              {userAllergens.length>0&&(
                <div style={{marginTop:10,padding:'8px 12px',background:'#FF3B3010',borderRadius:12,border:'1px solid #FF3B3030',fontSize:11,color:'#FF3B30',fontWeight:600,lineHeight:1.5}}>
                  ⚠️ Ocultando productos con: {userAllergens.map(k=>ALLERGENS.find(a=>a.k===k)?.label).filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <button className="tap" onClick={()=>{
              if(window.confirm('¿Reiniciar toda la configuración? Se borrarán todos tus datos.')){
                localStorage.clear(); window.location.reload();
              }
            }} style={{marginTop:12,width:'100%',padding:'12px',borderRadius:14,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textMuted,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:F}}>
              🔄 Reiniciar configuración
            </button>

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
                  <button className="tap" onClick={()=>window.location.reload()} style={{padding:'6px 12px',borderRadius:10,border:'none',background:'#007AFF',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:F,flexShrink:0}}>
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>

            <div style={{marginTop:12,background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:22}}>{autoTheme?'🌓':dark?'🌙':'☀️'}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Tema {autoTheme?'automático':dark?'oscuro':'claro'}</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>{autoTheme?'Oscuro 20:00–07:00 · Claro resto del día':'Toca para cambiar'}</div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button className="tap" onClick={()=>{setAutoTheme(!autoTheme);haptic('light');}} style={{padding:'5px 10px',borderRadius:10,border:`1px solid ${autoTheme?'#007AFF':C.border}`,background:autoTheme?'#007AFF18':C.surfaceAlt,color:autoTheme?'#007AFF':C.textSec,fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:F}}>Auto</button>
                {!autoTheme&&<button className="tap" onClick={()=>{setDark(!dark);LS.set('darkMode',!dark);haptic('light');}} style={{padding:'5px 10px',borderRadius:10,border:`1px solid ${C.border}`,background:C.surfaceAlt,color:C.textSec,fontSize:14,cursor:'pointer',fontFamily:F}}>{dark?'☀️':'🌙'}</button>}
              </div>
            </div>

            <div style={{marginTop:12,background:C.surfaceAlt,borderRadius:16,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:22}}>🔔</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recordatorios</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>Aviso para registrar comidas</div>
              </div>
              <button className="tap" onClick={()=>{setNotifEnabled(!notifEnabled);haptic('medium');}} style={{width:50,height:28,borderRadius:14,border:'none',cursor:'pointer',background:notifEnabled?'#34C759':'rgba(120,120,128,0.2)',position:'relative',transition:'background .25s'}}>
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
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{fontSize:10,color:C.textSec,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Metas diarias</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {customMetas&&<span style={{fontSize:9,color:'#007AFF',fontWeight:700,background:'#007AFF14',padding:'2px 8px',borderRadius:8}}>Personalizadas</span>}
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
          {/* Links legales */}
          <div style={{display:'flex',gap:14,justifyContent:'center',padding:'8px 0 4px'}}>
            <button onClick={()=>setShowLegal('privacy')} style={{background:'none',border:'none',fontSize:11,color:C.textMuted,cursor:'pointer',fontFamily:F}}>Política de privacidad</button>
            <span style={{color:C.textMuted,fontSize:11}}>·</span>
            <button onClick={()=>setShowLegal('terms')} style={{background:'none',border:'none',fontSize:11,color:C.textMuted,cursor:'pointer',fontFamily:F}}>Términos de servicio</button>
          </div>
        </div>}
      </div>

        {/* ══════════════════════════════════
            TAB 4 — ESTADÍSTICAS
        ══════════════════════════════════ */}
        {tab===3&&<div className={tabAnim}>
          {weekData.filter(d=>d.cal>0).length===0?(
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:56,marginBottom:14}}>📊</div>
              <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>Aún sin estadísticas</div>
              <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,maxWidth:260,margin:'0 auto 24px'}}>
                Registra comidas durante al menos un día y aquí verás tus tendencias
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
                <button className="tap" onClick={()=>setTab(1)} style={{padding:'12px 22px',borderRadius:16,border:'none',background:'#007AFF',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:F,boxShadow:'0 6px 16px rgba(0,122,255,0.3)'}}>➕ Registrar hoy</button>
                <button className="tap" onClick={()=>setTab(4)} style={{padding:'12px 22px',borderRadius:16,border:`1px solid ${C.border}`,background:C.surface,color:C.textSec,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:F}}>⚙️ Ver perfil</button>
              </div>
            </div>
          ):(
          <>

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

          {/* Acciones rápidas */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            {[
              {icon:'📅',l:'Historial',sub:'14 días',fn:()=>setShowHistory(true),col:'#007AFF'},
              {icon:'📊',l:'Esta semana',sub:'Resumen',fn:()=>setShowWeekly(true),col:'#34C759'},
              {icon:'🗓️',l:'Plan semanal',sub:'+ Compras',fn:()=>setShowPlanner(true),col:'#FF9500'},
              {icon:'📤',l:'Compartir',sub:'Mi progreso',fn:()=>setShowShare(true),col:'#AF52DE'},
              {icon:'📊',l:'Exportar CSV',sub:'Últimos 30 días',fn:exportCSV,col:'#34C759'},
              {icon:'🏆',l:'Reto 21 días',sub:'Nuevo hábito',fn:()=>setShowChallenge(true),col:'#FF9500'},
            ].map(({icon,l,sub,fn,col})=>(
              <button key={l} className="tap" onClick={fn} style={{padding:'14px 12px',borderRadius:18,border:`1px solid ${C.border}`,background:C.surface,display:'flex',flexDirection:'column',alignItems:'center',gap:6,cursor:'pointer',fontFamily:F}}>
                <div style={{width:44,height:44,borderRadius:14,background:`${col}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>{icon}</div>
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

          {/* Logros */}
          {(()=>{
            const allLogros=[
              {icon:'🌱',l:'Primer registro',  desc:'Registra tu primera comida',  done:log.length>0},
              {icon:'💧',l:'Bien hidratado',    desc:'Completa 8 vasos de agua',    done:agua>=8},
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
                    <div key={l} style={{
                      padding:'12px',borderRadius:16,
                      background:done?'#34C75910':C.surfaceAlt,
                      border:`1px solid ${done?'#34C75940':C.border}`,
                      opacity:done?1:0.6,
                    }}>
                      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:done?C.text:C.textSec,lineHeight:1.2}}>{l}</div>
                      {done&&<div style={{fontSize:10,color:'#34C759',fontWeight:700,marginTop:4}}>✓ Completado</div>}
                      {!done&&<div style={{fontSize:10,color:C.textMuted,marginTop:2,lineHeight:1.3}}>{desc}</div>}
                    </div>
                  ))}
                </div>
                {allLogros.length > visible.length || showAllLogros?(
                  <button className="tap" onClick={()=>setShowAllLogros(v=>!v)} style={{
                    width:'100%',padding:'9px',borderRadius:12,marginTop:10,
                    border:`1px solid ${C.border}`,background:'none',
                    color:accent,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:F,
                  }}>
                    {showAllLogros?'▲ Ver menos':'▼ Ver todos los logros ('+allLogros.length+')'}
                  </button>
                ):null}
              </div>
            );
          })()}

          {/* Mis alimentos — separado en secciones */}
          {customFoods.length>0&&(()=>{
            const scanned=customFoods.filter(f=>f.origen==='escaneado'||f.cat==='Escaneado'||f.barcode);
            const created=customFoods.filter(f=>f.origen!=='escaneado'&&f.cat!=='Escaneado'&&!f.barcode);
            const Row=({f})=>(
              <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${C.border}`,cursor:'pointer'}}
                onClick={()=>setDetail(f)}>
                <span style={{fontSize:22,flexShrink:0}}>{f.emoji||'📦'}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nombre}</div>
                  <div style={{fontSize:11,color:C.textSec,display:'flex',gap:8,alignItems:'center',marginTop:1}}>
                    <span>{f.cal} kcal · {f.porcion}g</span>
                    {(f.origen==='escaneado'||f.barcode)&&<span style={{fontSize:9,fontWeight:700,color:'#34C759',background:'#34C75918',padding:'1px 6px',borderRadius:6}}>📷 escaneado</span>}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setCustomFoods(customFoods.filter(x=>x.id!==f.id));haptic('light');}}
                  style={{background:'none',border:'none',color:C.textMuted,fontSize:16,cursor:'pointer',padding:4,flexShrink:0}}>✕</button>
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
      <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:30,background:C.navBg,backdropFilter:'blur(16px)',borderTop:`1px solid ${C.border}`,padding:'8px 8px calc(18px + env(safe-area-inset-bottom))',display:'flex',transition:'background .3s'}}>
        {[{icon:'🏠',lbl:'Inicio'},{icon:'➕',lbl:'Agregar'},{icon:'📋',lbl:'Mi Día'},{icon:'📊',lbl:'Stats'},{icon:'🎯',lbl:'Perfil'}].map(({icon,lbl},i)=>(
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

  useEffect(()=>{
    // Chequeo inicial de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      const skipAuth = localStorage.getItem('caloru_skipAuth');
      if (!session && !skipAuth) setShowAuth(true);
      setAuthReady(true);
    });
    // Escucha cambios de auth — navega automáticamente al entrar/salir
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setShowAuth(false);   // entró → mostrar app
        setAuthReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = (user) => {
    if (!user) localStorage.setItem('caloru_skipAuth', '1');
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
      <AppCore/>
    </ErrorBoundary>
  );
}
