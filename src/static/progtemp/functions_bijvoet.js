function SIGN (number) {
  if (number < 0) return -1; else return 1;
}

function sqr (number) {
  return number * number;
}

function thetas_p2plot (theta_s, pres, imgx, imgy) {
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  T_THETAN  = 253.15;
  T_THETAX   = 313.15;
  T_KAPPA   = 0.2857;
  T_KTHETA   = 332.0;
  xfrac = SIGN(theta_s - T_KTHETA) * Math.pow(Math.abs(theta_s - T_KTHETA), T_KAPPA) - SIGN(T_THETAN - T_KTHETA) * Math.pow(Math.abs(T_THETAN - T_KTHETA), T_KAPPA);
  xfrac /= SIGN(T_THETAX - T_KTHETA) * Math.pow(Math.abs(T_THETAX - T_KTHETA), T_KAPPA) - SIGN(T_THETAN - T_KTHETA) * Math.pow(Math.abs(T_THETAN - T_KTHETA), T_KAPPA);
  yfrac = Math.pow(pres, T_KAPPA) - Math.pow(T_PRESN, T_KAPPA);
  yfrac /= Math.pow(T_PRESX, T_KAPPA) - Math.pow(T_PRESN, T_KAPPA);
  x = Math.round((0.25 + 0.7 * xfrac) * imgx);
  y = Math.round((0.05 + 0.9 * yfrac) * imgy);
  return new Array(x, y);
}

function presFromYposition (y, imgy) {
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  T_KAPPA   = 0.2857;
  var n = (((((y / imgy) - 0.05) / 0.9) * (Math.pow(T_PRESX, T_KAPPA) - Math.pow(T_PRESN, T_KAPPA))) + Math.pow(T_PRESN, T_KAPPA));
  return (Math.pow(n, 1 / T_KAPPA));
}

function e_sat (Temp) {
  WV_CA   = 17.56881;
  WV_CB   = 241.8945;
  WV_CE   = 610.7;
  Temp  -= 273.15;
  return WV_CE * Math.exp(WV_CA * Temp / (Temp + WV_CB));
}

function LatHeat (Temp) {
  WV_CA   = 17.56881;
  WV_CB   = 241.8945;
  EPSILON = 0.622;
  R_AIR   = 287.04;
  return R_AIR / EPSILON * WV_CA * WV_CB * sqr(Temp / (Temp - 273.15 + WV_CB));
}

function dTempdp (pres, Temp, mode) {
  EPSILON = 0.622;
  HEATCP   = 1005;
  R_AIR   = 287.04;
  e_s = e_sat(Temp);
  r_s = EPSILON * e_s / (pres - e_s);
  Lv = LatHeat(Temp);
  dTdp = 2.0 * Temp / (7.0 * pres);
  if (mode == 's' || mode == 'S') {
    dTdp *= 1.0 + r_s * Lv / (R_AIR * Temp);
    dTdp /= 1.0 + r_s / (7.0 * EPSILON) + sqr(Lv / Temp) * r_s * EPSILON / (R_AIR * HEATCP);
  }
  return dTdp;
}

function TempPres (pres, pres0, Temp0, mode) {
  pstep = 1000;
  if (pres < pres0) pstep = -pstep;
  nstep = Math.round((pres - pres0) / pstep);
  if (nstep < 1) nstep = 1;
  pstep = (pres - pres0) / nstep;
  Temp_n = Temp0;
  pres_n = pres0;
  for (var n = 0; n < nstep; n++) {
    k1 = pstep * dTempdp(pres_n, Temp_n, mode);
    k2 = pstep * dTempdp(pres_n + 0.5 * pstep, Temp_n + 0.5 * k1, mode);
    k3 = pstep * dTempdp(pres_n + 0.5 * pstep, Temp_n + 0.5 * k2, mode);
    k4 = pstep * dTempdp(pres_n + pstep, Temp_n + k3, mode);
    Temp_n += k1 / 6.0 + k2 / 3.0 + k3 / 3.0 + k4 / 6.0;
    pres_n += pstep;
  }
  return Temp_n;
}

function TempPresDry (pres, pres0, Temp0) {
  return Temp0 * Math.pow(pres / pres0, 2.0 / 7.0);
}

function mixr2Tdew (mixr, pres) {
  WV_CA   = 17.56881;
  WV_CB   = 241.8945;
  WV_CE   = 610.7;
  EPSILON = 0.622;
  if (mixr < 1e-6) mixr = 1e-6;
  e_vap = pres * mixr / (EPSILON + mixr);
  return WV_CB / (WV_CA / Math.log(e_vap / WV_CE) - 1.0) + 273.15;
}

function plotDryAdiabats (ctx, dryadiabats, imgx, imgy) {
  T_NPSTEP   = 50;
  T_PRESR   = 100000;
  T_PREST   = 1000;
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  ctx.beginPath();
  var obj = [];
  for (var i = 0; i < dryadiabats.length; i++) {
    T0dry = dryadiabats[i] + 273.15;
    T0dry = TempPres(T_PREST, T_PRESR, T0dry, 's');
    pres = T_PRESN;
    theta = TempPresDry(pres, T_PREST, T0dry);
    theta = TempPres(T_PRESR, pres, theta, 's');
    coords1 = thetas_p2plot(theta, pres, imgx, imgy);
    ctx.moveTo(coords1[0], coords1[1]);
    for (var n = 1; n < T_NPSTEP; n++) {
      pres = T_PRESN + n * (T_PRESX - T_PRESN) / (T_NPSTEP - 1);
      theta = TempPresDry(pres, T_PREST, T0dry);
      theta = TempPres(T_PRESR, pres, theta, 's');
      coords2 = thetas_p2plot(theta, pres, imgx, imgy);
      ctx.lineTo(coords2[0], coords2[1]);
      ctx.moveTo(coords2[0], coords2[1]);
    }
  }
  ctx.strokeStyle = 'rgb(255,175,150)';
  ctx.stroke();
  ctx.closePath();
}

function plotIsotherms (ctx, isotherms, imgx, imgy) {
  T_NPSTEP   = 50;
  T_PRESR   = 100000;
  T_PREST   = 1000;
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  boundary_left_coords = thetas_p2plot(253.15, 106000, imgx, imgy);
  boundary_right_coords = thetas_p2plot(313.15, 106000, imgx, imgy);
  ctx.beginPath();
  ctx.lineWidth = 1;
  for (var m = 0; m < isotherms.length; m++) {
    pres = T_PRESN;
    Tiso = 2 * isotherms[m] + 273.15;
    theta = TempPres(T_PRESR, pres, Tiso, 's');
    coords1 = thetas_p2plot(theta, pres, imgx, imgy);
    ctx.moveTo(coords1[0], coords1[1]);
    for (var n = 1; n < T_NPSTEP; n++) {
      pres = T_PRESN + n * (T_PRESX - T_PRESN) / (T_NPSTEP - 1);
      theta = TempPres(T_PRESR, pres, Tiso, 's');
      coords2 = thetas_p2plot(theta, pres, imgx, imgy);
      if (Math.abs(Tiso - 273.15) < 0.5) {
        // afsluiten huidige lijnen
        ctx.strokeStyle = 'rgb(0,255,0)';
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(coords1[0], coords1[1]);  // eenmalig doen wat je normaal buiten de for loop doet
        ctx.lineTo(coords2[0], coords2[1]);
        ctx.moveTo(coords2[0], coords2[1]);
        ctx.strokeStyle = 'rgb(0,128,0)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.lineWidth = 1;
      }      else {
        ctx.lineTo(coords2[0], coords2[1]);
        ctx.moveTo(coords2[0], coords2[1]);
      }
      coords1[0] = coords2[0];
      coords1[1] = coords2[1];
    }
  }
  ctx.strokeStyle = 'rgb(0,255,0)';
  ctx.stroke();
  ctx.closePath();
  ctx.clearRect(0, 0, boundary_left_coords[0], imgy);
  ctx.clearRect(boundary_right_coords[0], 0, imgx, imgy);
}

function mixrFromTd_Pres (TdSfc, pres) {
  // expects Td in K, P in Pa
  // result in g/kg
  es = e_sat(TdSfc);
  mixr = (0.622 * es) / (pres - es);
  return 1000 * mixr;
}

function plotIsomixR (ctx, isomixr, imgx, imgy) {
  T_NPSTEP   = 50;
  T_PRESR   = 100000;
  T_PREST   = 1000;
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  boundary_left_coords = thetas_p2plot(253.15, 106000, imgx, imgy);
  boundary_right_coords = thetas_p2plot(313.15, 106000, imgx, imgy);
  ctx.beginPath();
  if (!ctx.setLineDash) { ctx.setLineDash = function () {}; } // als browser geen lineDash ondersteuning heeft, worden ze solid, maar zonder error
  if (!ctx.mozDash) { ctx.mozDash = function () {}; }
  ctx.setLineDash([5]);
  ctx.mozDash = [5];
  for (var m = 0; m < isomixr.length; m++) {
    pres = T_PRESN;
    mixr = isomixr[m] * 1e-3;
    theta = mixr2Tdew(mixr, pres);
    theta = TempPres(T_PRESR, pres, theta, 's');
    coords1 = thetas_p2plot(theta, pres, imgx, imgy);
    ctx.moveTo(coords1[0], coords1[1]);
    for (var n = 1; n < T_NPSTEP; n++) {
      pres = T_PRESN + n * (T_PRESX - T_PRESN) / (T_NPSTEP - 1);
      theta = mixr2Tdew(mixr, pres);
      theta = TempPres(T_PRESR, pres, theta, 's');
      coords2 = thetas_p2plot(theta, pres, imgx, imgy);
      ctx.lineTo(coords2[0], coords2[1]);
      ctx.moveTo(coords2[0], coords2[1]);
      coords1[0] = coords2[0];
      coords1[1] = coords2[1];
    }
  }
  ctx.strokeStyle = 'rgb(100,100,100)';
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([0]); ctx.mozDash = [1, 0];
  ctx.clearRect(boundary_right_coords[0], 0, imgx, imgy);
}

function plotWetadiabats (ctx, wetadiabats, imgx, imgy) {
  T_PRESN = 15000;
  T_PRESX = 106000;
  ctx.beginPath();
  for (var m = 0; m < wetadiabats.length; m++) {
    theta = wetadiabats[m] + 273.15;
    coords1 = thetas_p2plot(theta, T_PRESN, imgx, imgy);
    coords2 = thetas_p2plot(theta, T_PRESX, imgx, imgy);
    ctx.moveTo(coords1[0], coords1[1]);
    ctx.lineTo(coords2[0], coords2[1]);
  }
  ctx.strokeStyle = 'rgb(150,100,100)';
  ctx.stroke();
  ctx.closePath();
}

function plotIsobars (ctx, isobars, T_THETAn, T_THETAx, imgx, imgy) {
  ctx.beginPath();
  for (var i = 0; i < isobars.length; i++) {
    pres = isobars[i] * 100;
    coords1 = thetas_p2plot(T_THETAn, pres, imgx, imgy);
    coords2 = thetas_p2plot(T_THETAx, pres, imgx, imgy);
    ctx.moveTo(coords1[0], coords1[1]);
    ctx.lineTo(coords2[0], coords2[1]);
  }
  ctx.strokeStyle = 'rgb(128,128,255)';
  ctx.stroke();
  ctx.closePath();
}

function plotTTd (ctx, PSounding, TSounding, color, lineWidth, imgx, imgy) {
  if (!(PSounding && TSounding)) return;
  T_PRESR   = 100000;
  ctx.beginPath();
  theta = TempPres(T_PRESR, PSounding[0], TSounding[0], 's');
  coords1 = thetas_p2plot(theta, PSounding[0], imgx, imgy);
  ctx.moveTo(coords1[0], coords1[1]);
  for (var n = 1; n < TSounding.length; n++) {
    theta = TempPres(T_PRESR, PSounding[n], TSounding[n], 's');
    coords2 = thetas_p2plot(theta, PSounding[n], imgx, imgy);
    ctx.lineTo(coords2[0], coords2[1]);
    ctx.moveTo(coords2[0], coords2[1]);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.closePath();
  boundary_left_top_coords = thetas_p2plot(253.15, 15000, imgx, imgy);
  boundary_right_top_coords = thetas_p2plot(313.15, 15000, imgx, imgy);
  ctx.clearRect(boundary_left_top_coords[0], 0, boundary_right_top_coords[0], boundary_left_top_coords[1]);
}

function calc_Tw (T, Td, p) {
  T = T - 273.15;
  Td = Td - 273.15;
  p = p / 100;
  // p=1013.25;
  left_eq = 6.112 * Math.exp((17.67 * Td) / (Td + 243.5));
  right_eq = -9999;
  wet_bulb = 0;
  for (Tw = Td; Tw <= T; Tw = Tw + 0.01)  {
    right_eq_tmp = 6.112 * Math.exp((17.67 * Tw) / (Tw + 243.5)) - (p * (1005 / (0.622 * 2.5 * 1000000)) * (T - Tw));
    if (Math.abs(left_eq - right_eq_tmp) < Math.abs(left_eq - right_eq))    {
      right_eq  =  right_eq_tmp;
    }    else    {
      wet_bulb = (Tw + 273.15).toFixed(2);
      break;
    }
  }
  if (T == Td) { wet_bulb = (Td + 273.15).toFixed(2); }
  return parseFloat(wet_bulb);
}

function drawRotatedText (ctx, canvasWidth, canvasHeight) {
  // Tekenen getallen isotherm in de plot
  var TempArr   = new Array(-80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30);
  var hPaArr     = new Array(165, 195, 230, 275, 320, 375, 420, 475, 535, 620, 695, 885);
  var Theta_Arr   = new Array(17, 17, 17, 17, 17, 17.5, 19, 21, 24, 27.2, 32, 34.3);
  ctx.font = '10pt verdana';
  for (var n = 0; n < TempArr.length; n++) {
    ctx.save();
    coord  =  thetas_p2plot((Theta_Arr[n] + 273.15), (hPaArr[n] * 100), canvasWidth, canvasHeight);
    ctx.translate(coord[0], coord[1]);
    ctx.rotate((Math.PI / 180) * -55);
    ctx.fillText(TempArr[n], 0, 0);
    ctx.restore();
  }
  // Tekenen getallen isotherm aan de top
  var TempArr   = new Array(-20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40);
  var hPaArr     = 148;
  var Theta_Arr   = new Array(-23, -18, -12.5, -6.5, -0.7, 4.25, 9, 14, 19, 24, 29.1, 34.4, 39.4);
  ctx.font = '6pt verdana';
  for (var n = 0; n < TempArr.length; n++) {
    ctx.save();
    coord  =  thetas_p2plot((Theta_Arr[n] + 273.15), (hPaArr * 100), canvasWidth, canvasHeight);
    ctx.translate(coord[0], coord[1]);
    ctx.fillText(TempArr[n], 0, 0);
    ctx.restore();
  }
  // Tekenen getallen isotherm aan de top
  var isomixr = new Array(2, 4, 7, 10, 15, 20, 30);
  var hPaArr     = 1080;
  var Theta_Arr   = new Array(-12, -2, 6, 11, 18, 22.7, 29.8);
  ctx.font = '6pt verdana';
  for (var n = 0; n < TempArr.length; n++) {
    ctx.save();
    coord  =  thetas_p2plot((Theta_Arr[n] + 273.15), (hPaArr * 100), canvasWidth, canvasHeight);
    ctx.translate(coord[0], coord[1]);
    ctx.fillText(isomixr[n], 0, 0);
    ctx.restore();
  }
  // Tekenen getallen isobaren links
  var hPaArr     = new Array(1000, 925, 850, 700, 600, 500, 400, 300, 200);
  var Theta_Arr   = -26.5;
  ctx.font = '6pt verdana';
  for (var n = 0; n < hPaArr.length; n++) {
    ctx.save();
    coord  =  thetas_p2plot((Theta_Arr + 273.15), (400 + (hPaArr[n] * 100)), canvasWidth, canvasHeight);
    ctx.translate(coord[0], coord[1]);
    ctx.fillText(hPaArr[n], 0, 0);
    ctx.restore();
  }
  boundary_left_bottom_coords = thetas_p2plot(253.15, 105000, canvasWidth, canvasHeight);
  boundary_right_top_coords = thetas_p2plot(313.15, 15000, canvasWidth, canvasHeight);
  ctx.save();
  ctx.translate((boundary_left_bottom_coords[0] - 18), boundary_left_bottom_coords[1] - 5);
  ctx.font = '6pt verdana';
  ctx.fillText('hPa', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate((boundary_left_bottom_coords[0]), boundary_left_bottom_coords[1] + 10);
  ctx.font = '6pt verdana';
  ctx.fillText('g/kg', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate((boundary_right_top_coords[0] + 6), boundary_right_top_coords[1] - 4);
  ctx.font = '6pt verdana';
  ctx.fillText('°C', 0, 0);
  ctx.restore();
}

function plotWindbarbs (ctx, PSounding, ddSounding, ffSounding, color, imgx, imgy) {
  if (!(PSounding && ddSounding && ffSounding)) return;
  for (var i = 0; i < PSounding.length; i++) {
    if ((i / 2) % 2 == 0) { plotTemp = 309.15; }    else { plotTemp = 311.70; }
    coords = thetas_p2plot(plotTemp, PSounding[i], imgx, imgy);
    barb2image(ctx, coords[0], coords[1], ffSounding[i], ddSounding[i], 18, color);
  }
  boundary_left_top_coords = thetas_p2plot(253.15, 15000, imgx, imgy);
  boundary_right_top_coords = thetas_p2plot(313.15, 15000, imgx, imgy);
  ctx.clearRect(boundary_left_top_coords[0], 0, boundary_right_top_coords[0], boundary_left_top_coords[1]);
}

function plotLineaal (ctx, PSounding, colorft, colorkm, imgx, imgy) {
  // Plot hoogtevoeten/meters als lineaal aan de rechterkant
  if (!PSounding) return;
  T_X   = 313.55;
  T_X   = 313.55;
  T_P   = 15000;
  ctx.beginPath();
  coords_bottom  =  thetas_p2plot(T_X, PSounding[PSounding.length - 1], imgx + 3, imgy);
  coords_top    =  thetas_p2plot(T_X, T_P, imgx + 3, imgy);
  ctx.moveTo(coords_bottom[0], coords_bottom[1]);
  ctx.lineTo(coords_top[0], coords_top[1]);
  ctx.strokeStyle = colorft;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.moveTo((coords_bottom[0]), coords_bottom[1]);
  ctx.lineTo((coords_bottom[0] + 4), coords_bottom[1]);
  ctx.strokeStyle = colorft;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();

  ctx.save();
  ctx.translate((coords_bottom[0] + 4), coords_bottom[1] + 2);
  ctx.font = '6pt verdana';
  ctx.fillText('0', 0, 0);
  ctx.restore();

  // feet
  for (var m = 500; m <= 4500; m += 500) {
    coords = thetas_p2plot(T_X, fl2pres(m * 0.3048, PSounding[PSounding.length - 1]), imgx, imgy);
    if (m % 500 == 0 && m % 1000 != 0) {
      ctx.beginPath();
      ctx.moveTo((coords[0]), coords[1]);
      ctx.lineTo((coords[0] + 2), coords[1]);
      ctx.strokeStyle = colorft;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }
    if (m % 1000 == 0) {
      ctx.beginPath();
      ctx.moveTo((coords[0]), coords[1]);
      ctx.lineTo((coords[0] + 4), coords[1]);
      ctx.strokeStyle = colorft;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }
  }

  for (var m = 5000; m <= 44000; m += 1000) {
    coords = thetas_p2plot(T_X, fl2pres(m * 0.3048, PSounding[PSounding.length - 1]), imgx, imgy);
    ctx.beginPath();
    ctx.moveTo((coords[0]), coords[1]);
    ctx.lineTo((coords[0] + 4), coords[1]);
    ctx.strokeStyle = colorft;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
    if (m % 5000 == 0) {
      ctx.beginPath();
      ctx.moveTo((coords[0]), coords[1]);
      ctx.lineTo((coords[0] + 4), coords[1]);
      ctx.strokeStyle = colorft;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
      ctx.save();
      ctx.translate((coords[0] + 5), coords[1] + 2);
      ctx.font = '6pt verdana';
      ctx.fillText((m / 100), 0, 0);
      ctx.restore();
    }
  }

  for (m = 1000; m <= 13000; m += 1000) {
    coords = thetas_p2plot(T_X, fl2pres(m, PSounding[PSounding.length - 1]), imgx, imgy);
    ctx.beginPath();
    ctx.moveTo((coords[0]), coords[1]);
    ctx.lineTo((coords[0] + 6), coords[1]);
    ctx.strokeStyle = colorkm;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.closePath();
    if (m % 1000 == 0) {
      ctx.save();
      if ((m / 1000) != 6 && (m / 1000) != 3) { ctx.translate((coords[0] + 10), coords[1] + 2); }
      if ((m / 1000) == 6) { ctx.translate((coords[0] + 10), coords[1] + 5); }
      if ((m / 1000) == 3) { ctx.translate((coords[0] + 10), coords[1] + 6); }
      ctx.font = '6pt verdana';
      ctx.fillStyle = colorkm;
      ctx.fillText((m / 1000), 0, 0);
      ctx.restore();
    }
  }

  ctx.save();
  ctx.translate((coords_bottom[0] - 2), coords_bottom[1] + 12);
  ctx.font = '7pt verdana';
  ctx.fillStyle = colorft;
  ctx.fillText('FL/ft', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate((coords_bottom[0] - 2), coords_bottom[1] + 22);
  ctx.font = '7pt verdana';
  ctx.fillStyle = colorkm;
  ctx.fillText('km', 0, 0);
  ctx.restore();
}

//
/******************************************************************************/
/* Calculate pressure from FL                                                 */
/******************************************************************************/
function fl2pres (h, P0) {
  var R, L0, L1, g0, T0, T1, M, P1, h1;
  R = 8.31432;
  M = 0.0289644;
  g0 = 9.80665;
  T0 = 288.15;
  L0 = -0.0065;
    // P0 *= 100;
  T1 = 216.65;
  P1 = 22632.10;
  L1 = 0;
  h1 = 11000;
  if (h < 11000) {
    return P0 * (Math.pow((T0 / (T0 + L0 * (h - 0))), ((g0 * M) / (R * L0))));
  } else {
    return P1 * Math.exp((-g0 * M * (h - h1)) / (R * T1));
  }
}

/******************************************************************************/
/* Calculate FL from Pressure                                                 */
/******************************************************************************/
function pres2fl (pres, pressfc) {
  // presure in Pa
  var T0, T1, g, R, P11, h, GAMMA;
  T0 = 288.15;
  T1 = 216.65;
  g = 9.80665;
  R = 287.0528742;
  GAMMA = 0.0065;
  P11 = pressfc * Math.exp(-g / GAMMA / R * Math.log(T0 / T1));

  if (pres > 22632.04) { return (1 / GAMMA * (T0 - T0 / Math.exp(-GAMMA * R / g * Math.log(pres / pressfc))) / 30.48); } else { return ((11000 - R * T1 / g * Math.log(pres / 22632.04)) / 30.48); }
}

//
// unused begin
function display_json (jsonArray) {
  var result = '';
  for (var i = 0; i < jsonArray.length; i++) {
    result += ' [' + i + '] x:' + jsonArray[i].x + ' y:' + jsonArray[i].y;
  }
  return result;
}
// unused eind

/******************************************************************************/
/* This function plots a windvane indicating the windspeed 'ff' and direction  */
/* 'dd' at location (i,j) in an image using HTML5 Canvas. The windspeed should */
/* be given in m/s and the direction in degrees of 'meteorological direction', */
/* i.e., direction from which wind is coming.                                  */
/* The size and color of the windvanes are indicated by 'size' (in pixels) and */
/* 'color' (hex value #000000 for black).                                    */
/******************************************************************************/

function barb2image (ctx, i, j, ff, dd, size, color) {
  var iff, N25, N5, F2, n, Gp, Lp, Ls, cosdd, sindd;
  var varX = [];
  var varY = [];
  var DEG2RAD = (Math.PI / 180);  /* Conversion from degrees to radians. */

  /* Setting sizes of gap between barbs 'Gp', and relative lengths of barbs */
  /* parallel 'Lp' and perpendicular 'Ls' to windvane axis. */
  Gp = size / 8;
  Lp = size * Math.cos(DEG2RAD * 60) / 2;
  Ls = size * Math.sin(DEG2RAD * 60) / 2;

  /* Setting elements of rotation matrix for indicating wind direction. */
  cosdd = Math.cos(DEG2RAD * dd);
  sindd = Math.sin(DEG2RAD * dd);

  /* Calculation of the number of triangles (25m/s), the number of barbs */
  /* (5m/s), and the flag for a half barb (2.5m/s). */
  iff = Math.round(ff / 2.5);
  N25 = iff / 10;
  N5 = (iff % 10) / 2;
  F2 = (iff % 2);

  /* When more than one triangle has to be drawn, the size of the windvane is */
  /* increased. */
  if (N25 > 1) { size += (N25 - 1) * (Lp + Gp); }

  /* Drawing stick of windvane, or small circle when ff<5knots. */
  if (N25 || N5 || F2) {
    ctx.beginPath();
    ctx.moveTo(i, j);
    ctx.lineTo(i + size * sindd, j - size * cosdd);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }  else {
    ctx.beginPath();
    ctx.arc(i, j, (size * 4) / 20, 0, 360, false);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  /* Drawing the triangles, and adjusting position. */
  for (var n = 1; n <= N25; n++) {
    varX[0] = i + (size * sindd);
    varY[0] = j - (size * cosdd);
    varX[1] = i + size * sindd + Ls * cosdd;
    varY[1] = j - size * cosdd + Ls * sindd;
    varX[2] = i + size * sindd - Lp * sindd;
    varY[2] = j - size * cosdd + Lp * cosdd;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(varX[0], varY[0]);
    ctx.lineTo(varX[1], varY[1]);
    ctx.lineTo(varX[2], varY[2]);
    ctx.lineTo(varX[0], varY[0]);
    ctx.closePath();
    ctx.fill();
    size -= Gp + Lp;
  }

  /* Drawing the barbs, and adjusting position. */
  for (var n = 1; n <= N5; n++) {
    ctx.beginPath();
    ctx.moveTo(i + size * sindd, j - size * cosdd);
    ctx.lineTo(i + size * sindd + Ls * cosdd + Lp * sindd, j - size * cosdd + Ls * sindd - Lp * cosdd);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
    size -= Gp;
  }

  /* Drawing the half barb. */
  if (F2) {
    Ls /= 2;
    Lp /= 2;
    ctx.beginPath();
    ctx.moveTo(i + size * sindd, j - size * cosdd);
    ctx.lineTo(i + size * sindd + Ls * cosdd + Lp * sindd, j - size * cosdd + Ls * sindd - Lp * cosdd);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}

// hodo begin

/* Hodogram */
function plotHodo (ctx, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding) {
  if (!(PSounding && TSounding && TdSounding && ddSounding && ffSounding && TwSounding)) return;
  T_PRESN   = 15000;
  T_PRESX   = 106000;
  T_THETAN  = 253.15;
  T_THETAX   = 313.15;
  DEG2RAD = (Math.PI / 180);  /* Conversion from degrees to radians. */
  // Plot Hodo Borders
  coords_left_bottom = thetas_p2plot(T_THETAN, T_PRESX, canvasWidth, canvasHeight);  //, &i0,&j0
  var i0  = coords_left_bottom[0];
  var j0  = coords_left_bottom[1];
  coords_top_right = thetas_p2plot(T_THETAX, T_PRESN, canvasWidth, canvasHeight);     //, &i1,&j1
  var i1  = coords_top_right[0];
  var j1  = coords_top_right[1];
  coords3 = thetas_p2plot((15 + 273.15), (300 * 100), canvasWidth, canvasHeight);    //, &k0,&l0
  var k0  = coords3[0];
  var l0  = coords3[1];
  ctx.beginPath();
  ctx.rect(i0, j1, k0 - i0, l0 - j1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = 'grey';
  // ctx.stroke();
  ctx.closePath();

  // Plot hodo center cross
  ctx.beginPath();
  ctx.moveTo(-3 + i0 + (k0 - i0) / 2, j1 + (l0 - j1) / 2);
  ctx.lineTo(3 + i0 + (k0 - i0) / 2, j1 + (l0 - j1) / 2);
  ctx.moveTo(i0 + (k0 - i0) / 2, -3 + j1 + (l0 - j1) / 2);
  ctx.lineTo(i0 + (k0 - i0) / 2, 3 + j1 + (l0 - j1) / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.closePath();

  // Plot hodo ringen
  var c;
  var x1, y1, x2, y2, x3, y3, a, r;
  ctx.lineWidth = 1;
  for (var c = 10; c <= 100; c += 10) {
    if (c % 50 == 0) {
      ctx.strokeStyle = '#4185f3';
    }
    if (c % 50 != 0) {
      ctx.strokeStyle = '#A0C2F9';
    }
    r = (c / 100) * ((k0 - i0) / 2);
    ctx.beginPath();
    for (var a = 0; a < 360; a += 1) {
      x1 = i0 + (k0 - i0) / 2 + r * Math.cos(DEG2RAD * a);
      y1 = j1 + (l0 - j1) / 2 + r * Math.sin(DEG2RAD * a);
      x2 = i0 + (k0 - i0) / 2 + r * Math.cos(DEG2RAD * (a + 1));
      y2 = j1 + (l0 - j1) / 2 + r * Math.sin(DEG2RAD * (a + 1));
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.closePath();
  }

  // For later use:
  x1 = i0 + (k0 - i0) / 2; // for later use
  y1 = j1 + (l0 - j1) / 2; // for later use
  x2 = x1;
  y2 = y1;

  // Plot Winds in hodograph
  j1 = -1;
  for (var i = PSounding.length; i >= 0; i--) {
    ctx.beginPath();
    if (j1 > -1) {
      Psfc = PSounding[PSounding.length - 1];
      pres = PSounding[i];
      x3 = x1 + (ffSounding[i] / 0.5144) * Math.cos(DEG2RAD * (ddSounding[i] + 90));
      y3 = y1 + (ffSounding[i] / 0.5144) * Math.sin(DEG2RAD * (ddSounding[i] + 90));
      ctx.lineWidth = 2;
      if (pres2fl(pres, Psfc) > 0 && pres2fl(pres, Psfc) / 0.3048 < 100) {
        ctx.strokeStyle = 'blue';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 100 && pres2fl(pres, Psfc) / 0.3048 < 300) {
        ctx.strokeStyle = 'red';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 300 && pres2fl(pres, Psfc) / 0.3048 < 600) {
        ctx.strokeStyle = '#00CC00';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 600 && pres2fl(pres, Psfc) / 0.3048 < 900) {
        ctx.strokeStyle = 'rgba(255,153,51,1)';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 900 && pres2fl(pres, Psfc) / 0.3048 < 1200) {
        ctx.strokeStyle = 'rgba(255,51,255,1)';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 1200 && pres2fl(pres, Psfc) / 0.3048 < 1350) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      }
      if (pres2fl(pres, Psfc) / 0.3048 >= 1350) {
        continue;
        // ctx.strokeStyle = 'rgba(0,0,0,0)';
      }
      ctx.moveTo(x2, y2);
      ctx.lineTo(x3, y3);
      x2 = x3;
      y2 = y3;
    }
    j1 = j0;
    ctx.stroke();
    ctx.closePath();
  }

  // Plot legend
  var lgdtext = '';
  ctx.fillStyle = 'black';
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    if (i == 0) { ctx.strokeStyle = 'rgba(0,0,0,0.15)'; lgdtext = '12+km'; }
    if (i == 1) { ctx.strokeStyle = 'rgba(255,51,255,1)'; lgdtext = '9-12km'; }
    if (i == 2) { ctx.strokeStyle = 'rgba(255,153,51,1)'; lgdtext = '6-9km'; }
    if (i == 3) { ctx.strokeStyle = '#00CC00'; lgdtext = '3-6km'; }
    if (i == 4) { ctx.strokeStyle = 'red'; lgdtext = '1-3km'; }
    if (i == 5) { ctx.strokeStyle = 'blue'; lgdtext = '0-1km'; }

    ctx.moveTo(i0 + 2, l0 - (4 + (8 * i)));
    ctx.lineTo(i0 + 9, l0 - (4 + (8 * i)));
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.save();
    ctx.translate(i0 + 10, l0 - (1 + (8 * i)));
    ctx.font = '6pt verdana';
    ctx.fillText(lgdtext, 0, 0);
    ctx.restore();
  }
}

/*

//Reading and plotting of TEMP data from file, cont'd (Wind barbs).
float add = 0; // afwisselend links of rechts.
j1=-1;
rewind(fp);
while (fgets(line,sizeof(line),fp)) {
   if (sscanf(line,"%*f %f %f %f %f %f",&pres,&Tiso,&mixr,&dd,&ff)==5) {
    gdImageSetThickness(image,1);
      if (pres<0.0||dd<0.0||ff<0.0) continue;
      if (pres<T_PRESN||pres>T_PRESX) continue;
      thetas_p2plot(T_THETAN,pres,&i0,&j0);
      if (j1>=0&&XABS(j0-j1)<T_PGAPN) continue;
      if (add==0) add = 0.055*T_NCOLS; else add = 0; // afwisselend links en rechts
      barb2image(image,0.07*T_NCOLS+add,j0,ff,dd,0.04*T_NCOLS,black);
      if (windtab) {
        sprintf(string,"%03d%4i",(int)(10*round(dd/10)),(int)(ff/0.5144));
        gdImageString(image,gdFontSmall,0.11*T_NCOLS,j0,
                    (unsigned char *)string,black);
      }

      // hodogram
      if (j1>-1){
     gdImageSetThickness(image,2);
     gdImageSetAntiAliased(image, black);
     if (pres2fl(pres, strtof(Psfc, NULL))>0 && pres2fl(pres, strtof(Psfc, NULL))/0.3048<100){
        gdImageSetAntiAliased(image, blue);
     }
     if (pres2fl(pres, strtof(Psfc, NULL))/0.3048>=100 && pres2fl(pres, strtof(Psfc, NULL))/0.3048<300){
        gdImageSetAntiAliased(image, red);
     }
     if (pres2fl(pres, strtof(Psfc, NULL))/0.3048>=300 && pres2fl(pres, strtof(Psfc, NULL))/0.3048<600){
        gdImageSetAntiAliased(image, green);
     }
         x3 = x1+(ff/0.5144)*cos(DEG2RAD*(dd+90));
         y3 = y1+(ff/0.5144)*sin(DEG2RAD*(dd+90));
         if (x1!=x2 && y1!=y2) gdImageLine(image,x2,y2,x3,y3,gdAntiAliased);
         x2=x3;
         y2=y3;
      }
      j1=j0;
   }
}
fclose(fp);
*/

// hodo end

function drawProgtempBg (ctx, canvasWidth, canvasHeight) {
  if (!ctx) return;
    // Set variabelen:
  var wetAndDryAdiabats = new Array(-20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40);
  var isotherms = new Array(); for (var i = -50; i <= 40; i++) { isotherms.push(i); }
  var isomixr = new Array(2, 4, 7, 10, 15, 20, 30);
  var isobars = new Array(1000, 925, 850, 700, 600, 500, 400, 300, 200);

    // Plot de achtergrondlijnen:
  plotDryAdiabats(ctx, wetAndDryAdiabats, canvasWidth, canvasHeight);
  plotIsotherms(ctx, isotherms, canvasWidth, canvasHeight);
  plotIsomixR(ctx, isomixr, canvasWidth, canvasHeight);
  plotWetadiabats(ctx, wetAndDryAdiabats, canvasWidth, canvasHeight);
  plotIsobars(ctx, isobars, 253.15, 313.15, canvasWidth, canvasHeight);
  drawRotatedText(ctx, canvasWidth, canvasHeight);
}

function drawProgtemp (ctx, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Plot T/Td/Tw/Tv
  plotTTd(ctx, PSounding, TSounding, '#ff0000', 1.5, canvasWidth, canvasHeight);
  plotTTd(ctx, PSounding, TdSounding, '#0000ff', 1.5, canvasWidth, canvasHeight);
  plotTTd(ctx, PSounding, TwSounding, '#000000', 0.8, canvasWidth, canvasHeight);
  plotTTd(ctx, PSounding, TvSounding, '#993333', 0.8, canvasWidth, canvasHeight);
  plotWindbarbs(ctx, PSounding, ddSounding, ffSounding, '#000000', canvasWidth, canvasHeight);
  plotLineaal(ctx, PSounding, '#000000', '#cc0000', canvasWidth, canvasHeight);
}

var PSfc, CCL, TCCL, ELHeightFt, TELinCelsius, PCCL, PEL;
function setProgtempInputAndDraw (fcH, jsonArray, ctx, canvasWidth, canvasHeight) {
  var tempArray = jsonArray['fcH' + fcH];  // set tempArray
  var PSounding = new Array(); for (var i = 0; i < tempArray[0].P.length; i++) { PSounding.push(tempArray[0].P[i]); }
  PSfc = PSounding[0];
  var TSounding = new Array();  for (var i = 0; i < tempArray[0].T.length; i++) { TSounding.push(tempArray[0].T[i]); }
  var TdSounding = new Array(); for (var i = 0; i < tempArray[0].Td.length; i++) { TdSounding.push(tempArray[0].Td[i]); }
  var ddSounding = new Array(); for (var i = 0; i < tempArray[0].dd.length; i++) { ddSounding.push(tempArray[0].dd[i]); }
  var ffSounding = new Array(); for (var i = 0; i < tempArray[0].ff.length; i++) { ffSounding.push(tempArray[0].ff[i]); }
    // Tw en Tv kunnen ook vooraf berekend worden om javascript te versnellen @ optimaliseren later
  var TwSounding = new Array();  for (var i = 0; i < TSounding.length; i++) { TwSounding.push(calc_Tw(TSounding[i], TdSounding[i], PSounding[i])); }
  var TvSounding = new Array();  for (var i = 0; i < TSounding.length; i++) { TvSounding.push(calc_Tv(TSounding[i], TdSounding[i], PSounding[i])); }
  drawProgtemp(ctx, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding);
  plotHodo(ctx, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding);
  var CCLinfo = determineCCL(canvas, PSounding, TSounding, TdSounding, canvasWidth, canvasHeight);
  CCL = CCLinfo[0];
  TCCL = CCLinfo[1];
  ELHeightFt = CCLinfo[2];
  TELinCelsius = CCLinfo[3];
  PCCL = CCLinfo[4];
  PEL = CCLinfo[5];
  TdCCLinCelsius = CCLinfo[6];
  var CAPES = calcCAPES(PCCL, PEL, TCCL, TdCCLinCelsius, TELinCelsius, PSounding, TSounding, TdSounding, TwSounding, canvasWidth, canvasHeight);
  sbCAPE = CAPES[0];
  muCAPE = CAPES[1];
  mlCAPE = CAPES[2];
  twCAPE = CAPES[3];
  sbCIN = CAPES[4];
  muCIN = CAPES[5];
  mlCIN = CAPES[6];
  twCIN = CAPES[7];
    // calc_CIN_CAPE(PSounding,TSounding,TdSounding);
}

function calc_CIN_CAPE (PSounding, TSounding, TdSounding) {
/*
  T_PRESR   = 100000;
  // Bepaal representatieve T/Td

  // SURFACE PARCEL - niet doorgemengd

  mixr=mixrFromTd_Pres(TdSounding[0],PSounding[0])*1e-3;
  //for(var i=1;i<PSounding.length;i++){
  for(var i=1;i<5;i++){
    Tdry  = TempPresDry(PSounding[i],PSounding[0],TSounding[0]);
    Tmixr  = TempPres(T_PRESR,PSounding[i],mixr2Tdew(mixr,PSounding[i]),'s');
    //Tmixr  = mixr2Tdew(mixr,PSounding[i]);
    if((Tdry-Tmixr)<0){
      dP    = (PSounding[i-1]-PSounding[i]);
      dTdry  = (TempPresDry(PSounding[i],PSounding[0],TSounding[0])-TempPresDry(PSounding[i-1],PSounding[0],TSounding[0]));
      dmixr  =(TempPres(T_PRESR,PSounding[i],mixr2Tdew(mixr,PSounding[i]),'s')-TempPres(T_PRESR,PSounding[i],mixr2Tdew(mixr,PSounding[i-1]),'s'));
      for(var n=10;n<dP;n=n+10){
        TdryTemp  = Tdry-((dTdry/dP)*n);
        TmixrTemp  = Tmixr-((dmixr/dP)*n);
        alert('TdryTemp: '+TdryTemp+' TmixrTemp: '+TmixrTemp);
      }

      alert('dP: '+dP+' dTdry: '+dTdry+' dmixr: '+dmixr);
      alert('Tdry1: '+TempPresDry(PSounding[i-1],PSounding[0],TSounding[0])+' Tdry2: '+TempPresDry(PSounding[i],PSounding[0],TSounding[0]));
      alert('Tmixr1: '+mixr2Tdew(mixr,PSounding[i-1])+' Tmixr2: '+mixr2Tdew(mixr,PSounding[i]));
      alert('P1: '+PSounding[i-1]+' P2: '+PSounding[i]);
      //alert('Tdry: '+TempPresDry(PSounding[i-1],PSounding[0],TSounding[0])+' Tmixr: '+mixr2Tdew(mixr,PSounding[i-1])+'PSounding: '+PSounding[i-1]+' Tdry: '+Tdry+' Tmixr: '+Tmixr+'PSounding: '+PSounding[i]);}
    }
  }
    /*
    coordsT=thetas_p2plot(TempPres(T_PRESR,PSounding[i],TSounding[i],'s'),PSounding[i],imgx,imgy);
    coordsM=thetas_p2plot(TempPres(T_PRESR,PSounding[i],mixr2Tdew(mixr,PSounding[i]),'s'),PSounding[i],imgx,imgy);
    if((coordsT[0]-coordsM[0])<0){
      coordsTmin1=thetas_p2plot(TempPres(T_PRESR,PSounding[i-1],TSounding[i],'s'),PSounding[i-1],imgx,imgy);
      coordsMmin1=thetas_p2plot(TempPres(T_PRESR,PSounding[i-1],mixr2Tdew(mixr,PSounding[i-1]),'s'),PSounding[i-1],imgx,imgy);
      PCCL=(PSounding[i-1]+((PSounding[i]-PSounding[i-1])/2));
      TCCL=(TSounding[i-1]+((TSounding[i]-TSounding[i-1])/2));
      var CCLHeightFt=Math.round(100*pres2fl(PCCL,PSounding[0]));
      var TCCLinCelsius=Math.round((TCCL-273.15)*100)/100;
      var indexAbvCCL=(i);
      break;
    }
  }
  */
}

function calc_Tv (T, Td, Pres) {
  // Calculate Virtual Temperature, used for CAPE
  var r   = mixrFromTd_Pres(Td, Pres) / 1000;
  var Tv   = T * (1 + (0.61 * r));
  return Tv;
}

function calcCAPES (PCCL, PEL, TCCL, TdCCLinCelsius, TELinCelsius, PSounding, TSounding, TdSounding, TwSounding, imgx, imgy) {
  // SBcape -->begin<--
  mixr_SB    = mixrFromTd_Pres(TdSounding[0], PSounding[0]) * 1e-3;
  var PCCL_SB = TCCL_SB = indexAbvCCL_SB = 0;
  for (var i = 1; i < PSounding.length; i++) {
    tmp_Tdry  = TempPresDry(PSounding[i], PSounding[0], TSounding[0]);
    tmp_Tmixr  = TempPres(PSounding[0], PSounding[i], mixr2Tdew(mixr_SB, PSounding[i]), 's');
    if (tmp_Tmixr > tmp_Tdry) {
      var Pdiff    = PSounding[i] - PSounding[i - 1];
      var Tdrydiff  = TempPresDry(PSounding[i - 1], PSounding[0], TSounding[0]) - tmp_Tdry;
      var TTmixrdiff  = TempPres(PSounding[0], PSounding[i - 1], mixr2Tdew(mixr_SB, PSounding[i - 1]), 's') - tmp_Tmixr;
      var rateTdry  = Tdrydiff / Pdiff;
      var rateTmixr  = TTmixrdiff / Pdiff;
      // alert('P-1 '+PSounding[i-1]+' P '+PSounding[i]+' tmp_Tdry-1 '+TempPresDry(PSounding[i-1],PSounding[0],TSounding[0])+' tmp_Tdry '+tmp_Tdry+' tmp_Tmixr-1'+TempPres(PSounding[0],PSounding[i-1],mixr2Tdew(mixr_SB,PSounding[i-1]),'s')+' tmp_Tmixr '+tmp_Tmixr);
      // alert('P-1 '+PSounding[i-1]+' P '+PSounding[i]+' Pdiff '+Pdiff+' Tdrydiff '+Tdrydiff+' TTmixr '+TTmixrdiff+' rateTdry '+rateTdry+' rateTmixr '+rateTmixr);
      for (k = 0; k <= Math.abs(Pdiff); k = k + 15) {
        // alert('k: '+k+' ttdry: '+(tmp_Tdry+(-rateTdry*k))+' ttmixr: '+(tmp_Tmixr+(-rateTmixr*k)));
        if ((tmp_Tmixr + (-rateTmixr * k)) - (tmp_Tdry + (-rateTdry * k)) < 0) {
          // alert('k: '+k+' diff '+((tmp_Tmixr+(-rateTmixr*k))-(tmp_Tdry+(-rateTdry*k))));
          PCCL_SB      = (PSounding[i] + k);
          TCCL_SB      = (tmp_Tdry + (-rateTdry * k));
          indexAbvCCL_SB  = i;
          break;
        }
      }
    }
    if (PCCL_SB != 0 && TCCL_SB != 0 && indexAbvCCL_SB != 0) { break; }
  }

  // var T_SBparcel=TempPres(T_PRESR,PCCL_SB,TCCL_SB,'s');
  var T_SBparcel = TCCL_SB;
  // alert('T_SBparcel: '+(T_SBparcel-273.14));
  var sbParcelBottom = sbParcelTop = 0;
  for (var i = indexAbvCCL_SB; i < PSounding.length; i++) {
    tmpTParcel = TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
    if (tmpTParcel < T_SBparcel && sbParcelBottom == 0) { sbParcelBottom = i; }
    if (tmpTParcel > T_SBparcel && sbParcelBottom != 0) { var sbParcelTop = i - 1; break; }
  }

  var sbCAPE = tmpCAPE = 0;
  if (sbParcelTop != sbParcelBottom) {
    for (var i = sbParcelBottom; i <= sbParcelTop; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpCAPE = (9.81 / Tenv) * (T_SBparcel - Tenv) * (Hght2 - Hght1);
      sbCAPE = sbCAPE + tmpCAPE;
    }
  }
  var sbCIN = tmpCIN = 0;
  if (indexAbvCCL_SB != sbParcelBottom) {
    for (var i = indexAbvCCL_SB; i < sbParcelBottom; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpCIN = (9.81 / Tenv) * (T_SBparcel - Tenv) * (Hght2 - Hght1);
      sbCIN = sbCIN + tmpCIN;
    }
  }
  // SBcape -->end<--

  // TWcape -->begin<--
  var max = maxTwIndex = -999;
  for (var i = 0; i < (sbParcelTop + 5); i++) {
    if (PSounding[i] > 60000) {
      var tmpTW = TwSounding[i];
      // var tmpTW = TempPres(T_PRESR,PSounding[i],TSounding[i]);
      // alert('i '+i+' PSounding[i] '+PSounding[i]+' tmpTW '+tmpTW);
      if (tmpTW > max) {
        maxTwIndex = i;
        max = tmpTW;
      }
    }
  }
  // alert('sbParcelTop '+sbParcelTop);
  // alert('maxTwIndex '+maxTwIndex+' max '+TwSounding[maxTwIndex]);

  mixr_TW    = mixrFromTd_Pres(TdSounding[maxTwIndex], PSounding[maxTwIndex]) * 1e-3;
  var PCCL_TW = TCCL_TW = indexAbvCCL_TW = 0;
  for (var i = maxTwIndex; i < PSounding.length; i++) {
    tmp_Tdry  = TempPresDry(PSounding[i], PSounding[maxTwIndex], TSounding[maxTwIndex]);
    tmp_Tmixr  = TempPres(PSounding[maxTwIndex], PSounding[i], mixr2Tdew(mixr_TW, PSounding[i]), 's');
    // alert ('tmp_Tdry '+tmp_Tdry+' tmp_Tmixr '+tmp_Tmixr);
    if (tmp_Tmixr > tmp_Tdry) {
      var Pdiff    = PSounding[i] - PSounding[i - 1];
      var Tdrydiff  = TempPresDry(PSounding[i - 1], PSounding[maxTwIndex], TSounding[maxTwIndex]) - tmp_Tdry;
      var TTmixrdiff  = TempPres(PSounding[maxTwIndex], PSounding[i - 1], mixr2Tdew(mixr_TW, PSounding[i - 1]), 's') - tmp_Tmixr;
      var rateTdry  = Tdrydiff / Pdiff;
      var rateTmixr  = TTmixrdiff / Pdiff;
      // alert('P '+PSounding[i]+' Pdiff '+Pdiff+' Tdrydiff '+Tdrydiff+' TTmixr '+TTmixrdiff+' rateTdry '+rateTdry+' rateTmixr '+rateTmixr);
      for (k = 0; k <= Math.abs(Pdiff); k = k + 15) {
        // alert('k: '+k+' ttdry: '+(tmp_Tdry+(-rateTdry*k))+' ttmixr: '+(tmp_Tmixr+(-rateTmixr*k)));
        if ((tmp_Tmixr + (-rateTmixr * k)) - (tmp_Tdry + (-rateTdry * k)) < 0) {
          // alert('k: '+k+' diff '+((tmp_Tmixr+(-rateTmixr*k))-(tmp_Tdry+(-rateTdry*k))));
          PCCL_TW      = (PSounding[i] + k);
          TCCL_TW      = (tmp_Tdry + (-rateTdry * k));
          indexAbvCCL_TW  = i;
          break;
        }
      }
    }
    if (PCCL_TW != 0 && TCCL_TW != 0 && indexAbvCCL_TW != 0) { break; }
  }

  // var T_TWparcel=TempPres(T_PRESR,PCCL_TW,TCCL_TW,'s');
  var T_TWparcel = TCCL_TW;
  // alert('T_TWparcel: '+(T_TWparcel-273.14));
  var twParcelBottom = twParcelTop = 0;
  for (var i = indexAbvCCL_TW; i < PSounding.length; i++) {
    tmpTParcel = TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
    if (tmpTParcel < T_TWparcel && twParcelBottom == 0) { twParcelBottom = i; }
    if (tmpTParcel > T_TWparcel && twParcelBottom != 0) { var twParcelTop = i - 1; break; }
  }

  var twCAPE = tmpCAPE = 0;
  if (twParcelTop != twParcelBottom) {
    for (var i = twParcelBottom; i <= twParcelTop; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpCAPE = (9.81 / Tenv) * (T_TWparcel - Tenv) * (Hght2 - Hght1);
      twCAPE = twCAPE + tmpCAPE;
    }
  }
  var twCIN = tmpCIN = 0;
  if (indexAbvCCL_TW != twParcelBottom) {
    for (var i = indexAbvCCL_TW; i < twParcelBottom; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpCIN = (9.81 / Tenv) * (T_TWparcel - Tenv) * (Hght2 - Hght1);
      twCIN = twCIN + tmpCIN;
    }
  }
  // TWcape -->end<--

  // MUcape -->begin<--
  var Tmucape = Tmucapelvl = Tmucin = muPrclBttm = muPrclTp = 0;
  for (var n = 0; n < PSounding[n]; n++) {
    if (PSounding[n] < 60000) { break; } // kijken tot 600 hPa naar
    mixr_MU    = mixrFromTd_Pres(TdSounding[n], PSounding[n]) * 1e-3;
    var PCCL_MU  = TCCL_MU = indexAbvCCL_MU = 0;
    for (var i = n; i < PSounding.length; i++) {
      // nat en droogadiabaat berekenen
      tmp_Tdry  = TempPresDry(PSounding[i], PSounding[n], TSounding[n]);
      tmp_Tmixr  = TempPres(PSounding[n], PSounding[i], mixr2Tdew(mixr_MU, PSounding[i]), 's');
      if (tmp_Tmixr > tmp_Tdry) {
        var Pdiff    = PSounding[i] - PSounding[i - 1];
        var Tdrydiff  = TempPresDry(PSounding[i - 1], PSounding[n], TSounding[n]) - tmp_Tdry;
        var TTmixrdiff  = TempPres(PSounding[n], PSounding[i - 1], mixr2Tdew(mixr_MU, PSounding[i - 1]), 's') - tmp_Tmixr;
        var rateTdry  = Tdrydiff / Pdiff;
        var rateTmixr  = TTmixrdiff / Pdiff;
        // alert('P '+PSounding[i]+' Pdiff '+Pdiff+' Tdrydiff '+Tdrydiff+' TTmixr '+TTmixrdiff+' rateTdry '+rateTdry+' rateTmixr '+rateTmixr);
        for (k = 0; k <= Math.abs(Pdiff); k = k + 15) {
          // alert('k: '+k+' ttdry: '+(tmp_Tdry+(-rateTdry*k))+' ttmixr: '+(tmp_Tmixr+(-rateTmixr*k)));
          if ((tmp_Tmixr + (-rateTmixr * k)) - (tmp_Tdry + (-rateTdry * k)) < 0) {
            // alert('k: '+k+' diff '+((tmp_Tmixr+(-rateTmixr*k))-(tmp_Tdry+(-rateTdry*k))));
            PCCL_MU      = (PSounding[i] + k);
            TCCL_MU      = (tmp_Tdry + (-rateTdry * k));
            indexAbvCCL_MU  = i;
            break;
          }
        }
      }
      if (PCCL_MU != 0 && TCCL_MU != 0 && indexAbvCCL_MU != 0) { break; }
    }
    // var T_MUparcel=TempPres(T_PRESR,PCCL_MU,TCCL_MU,'s'); // wel refereren naar gronddruk?
    var T_MUparcel = TCCL_MU;
    // alert('indexAbvCCL_MU '+indexAbvCCL_MU);
    // var ttttmpTParcel=TempPres(T_PRESR,PSounding[indexAbvCCL_MU],TSounding[indexAbvCCL_MU],'s')
    // alert('indexAbvCCL_MU '+indexAbvCCL_MU+' T_MUparcel '+T_MUparcel+' TabvMU '+ttttmpTParcel+' PCCL_MU '+PCCL_MU+' TCCL_MU '+TCCL_MU);
    // alert('T_MUparcel '+T_MUparcel+ ' '+(T_MUparcel-273.14));
    var muParcelBottom = muParcelTop = 0;
    for (var i = indexAbvCCL_MU; i < PSounding.length; i++) {
      tmpTParcel = TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      if (tmpTParcel <= T_MUparcel && muParcelBottom == 0) { muParcelBottom = i; }
      if (tmpTParcel > T_MUparcel && muParcelBottom != 0) { var muParcelTop = i - 1; break; }
      // alert('tmpTParcel '+tmpTParcel+' T_MUparcel '+T_MUparcel);
    }
    // alert('muParcelBottom '+muParcelBottom+' Pbtm '+PSounding[muParcelBottom]+' muParcelTop '+muParcelTop+' Ptp '+PSounding[muParcelTop]);
    var muCAPE = tmpmuCAPE = 0;
    if (muParcelTop != muParcelBottom) {
    // alert('muParcelBottom '+muParcelBottom+' muParcelTop '+muParcelTop);
      for (var i = muParcelBottom; i <= muParcelTop; i++) {
        var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
        var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
        var Tenv  =  ((Tenv1 + Tenv2) / 2);
        var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
        var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
        tmpmuCAPE = (9.81 / Tenv) * (T_MUparcel - Tenv) * (Hght2 - Hght1);
        // alert('start: '+PSounding[(indexAbvCCL_MU+1)]+ ' end: '+PSounding[muParcelTop]+ ' tmpmuCAPE '+tmpmuCAPE);
        muCAPE = muCAPE + tmpmuCAPE;
      }
      // alert('muCAPE '+muCAPE);
    }
    var muCIN = tmpCIN = 0;
    if (indexAbvCCL_MU != muParcelBottom) {
      for (var i = indexAbvCCL_MU; i < muParcelBottom; i++) {
        var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
        var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
        var Tenv  =  ((Tenv1 + Tenv2) / 2);
        var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
        var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
        tmpCIN = (9.81 / Tenv) * (T_MUparcel - Tenv) * (Hght2 - Hght1);
        muCIN = muCIN + tmpCIN;
      }
    }
    if (muCAPE > Tmucape) {
      Tmucin = muCIN;
      Tmucape = muCAPE;
      Tmucapelvl = n;
      TindexAbvCCL_MU = indexAbvCCL_MU;
      TPCCL_MU = PCCL_MU;
      muPrclBttm = muParcelBottom;
      muPrclTp = muParcelTop;
    }
  // TODO was niet commentaar
  // delete PCCL_MU,TCCL_MU;
  }
  // alert('P '+PSounding[muPrclBttm]+' muParcelBottom '+muParcelBottom+ ' muPrclBttm '+muPrclBttm+' P '+PSounding[muPrclTp]+' muParcelTop '+muParcelTop+' muPrclTp '+muPrclTp);
  // MUcape -->end<--

  // MLcape -->begin<--
  var MLid = ML_tmpT = ML_tmpTd = ML_theta_tmp_T = ML_theta_tmp_Td = mixr_ML = 0;
  for (var i = 0; i < PSounding[i]; i++) {
    if ((PSounding[0] - PSounding[i]) > 10000) { MLid = i; break; }
    ML_theta_tmp_T  = ML_theta_tmp_T + (TSounding[i] * Math.pow(T_PRESR / PSounding[i], 0.286));
    mixr_ML    = mixr_ML + mixrFromTd_Pres(TdSounding[i], PSounding[i]) * 1e-3;
  }
  ML_thetaT  = ML_theta_tmp_T / MLid;
  mixr_ML    = mixr_ML / MLid;

  var PCCL_ML = TCCL_ML = indexAbvCCL_ML = 0;
  for (var i = 1; i < PSounding.length; i++) {
    tmp_Tdry  = TempPresDry(PSounding[i], PSounding[0], TSounding[0]);
    tmp_Tmixr  = TempPres(PSounding[0], PSounding[i], mixr2Tdew(mixr_ML, PSounding[i]), 's');
    if (tmp_Tmixr > tmp_Tdry) {
      var Pdiff    = PSounding[i] - PSounding[i - 1];
      var Tdrydiff  = TempPresDry(PSounding[i - 1], PSounding[0], TSounding[0]) - tmp_Tdry;
      var TTmixrdiff  = TempPres(PSounding[0], PSounding[i - 1], mixr2Tdew(mixr_ML, PSounding[i - 1]), 's') - tmp_Tmixr;
      var rateTdry  = Tdrydiff / Pdiff;
      var rateTmixr  = TTmixrdiff / Pdiff;
      // alert('P '+PSounding[i]+' Pdiff '+Pdiff+' Tdrydiff '+Tdrydiff+' TTmixr '+TTmixrdiff+' rateTdry '+rateTdry+' rateTmixr '+rateTmixr);
      for (k = 0; k <= Math.abs(Pdiff); k = k + 15) {
        // alert('k: '+k+' ttdry: '+(tmp_Tdry+(-rateTdry*k))+' ttmixr: '+(tmp_Tmixr+(-rateTmixr*k)));
        if ((tmp_Tmixr + (-rateTmixr * k)) - (tmp_Tdry + (-rateTdry * k)) < 0) {
          // alert('k: '+k+' diff '+((tmp_Tmixr+(-rateTmixr*k))-(tmp_Tdry+(-rateTdry*k))));
          PCCL_ML      = (PSounding[i] + k);
          TCCL_ML      = (tmp_Tdry + (-rateTdry * k));
          indexAbvCCL_ML  = i;
          break;
        }
      }
    }
    if (PCCL_ML != 0 && TCCL_ML != 0 && indexAbvCCL_ML != 0) { break; }
  }

  // var T_MLparcel=TempPres(T_PRESR,PCCL_ML,TCCL_ML,'s');
  var T_MLparcel = TCCL_ML;
  // alert('T_MLparcel: '+(T_MLparcel-273.14));

  var mlParcelBottom = mlParcelTop = 0;
  for (var i = indexAbvCCL_ML; i < PSounding.length; i++) {
    tmpTParcel = TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
    if (tmpTParcel < T_MLparcel && mlParcelBottom == 0) { mlParcelBottom = i; }
    if (tmpTParcel > T_MLparcel && mlParcelBottom != 0) { var mlParcelTop = i - 1; break; }
  }
  var mlCAPE = tmpMLCAPE = 0;
  if (mlParcelTop != mlParcelBottom) {
    for (var i = mlParcelBottom; i <= mlParcelTop; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpMLCAPE = (9.81 / Tenv) * (T_MLparcel - Tenv) * (Hght2 - Hght1);
      mlCAPE = mlCAPE + tmpMLCAPE;
    }
  }
  var mlCIN = tmpCIN = 0;
  if (indexAbvCCL_ML != mlParcelBottom) {
    for (var i = indexAbvCCL_ML; i < mlParcelBottom; i++) {
      var Tenv1  =  TempPres(T_PRESR, PSounding[i - 1], TSounding[i - 1], 's');
      var Tenv2  =  TempPres(T_PRESR, PSounding[i], TSounding[i], 's');
      var Tenv  =  ((Tenv1 + Tenv2) / 2);
      var Hght1  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i - 1], PSounding[0]));
      var Hght2  =  Math.round(0.3048 * 100 * pres2fl(PSounding[i], PSounding[0]));
      tmpCIN = (9.81 / Tenv) * (T_MLparcel - Tenv) * (Hght2 - Hght1);
      mlCIN = mlCIN + tmpCIN;
    }
  }

  // MLcape -->end<--

  // alert(' SBbtm '+sbParcelBottom+' SBtp '+sbParcelTop+' TWbtm '+twParcelBottom+' TWtp '+twParcelTop+' MUbtm '+muParcelBottom+' MUtp '+muParcelTop+  ' MLbtm '+mlParcelBottom+' MLtp '+mlParcelTop);
  // alert('PCCL_SB '+Math.round(100*pres2fl(PCCL_SB,PSounding[0]))+' sbCAPE: '+Math.round(sbCAPE)+' TPCCL_MU '+Math.round(100*pres2fl(TPCCL_MU,PSounding[0]))+' muCAPE '+Math.round(Tmucape)+' PCCL_ML '+Math.round(100*pres2fl(PCCL_ML,PSounding[0]))+' mlCAPE '+Math.round(mlCAPE)+' PCCL_TWL '+Math.round(100*pres2fl(PCCL_TW,PSounding[0]))+' twCAPE '+Math.round(twCAPE));
  // alert('indexAbvCCL_SB '+indexAbvCCL_SB+' indexAbvCCL_MU '+TindexAbvCCL_MU+' indexAbvCCL_ML '+indexAbvCCL_ML+' indexAbvCCL_TW '+indexAbvCCL_TW);
  // alert('T '+TSounding[TindexAbvCCL_MU]+' Td '+TdSounding[TindexAbvCCL_MU]+' P '+PSounding[TindexAbvCCL_MU]);
  var output = new Array(Math.round(sbCAPE), Math.round(Tmucape), Math.round(mlCAPE), Math.round(twCAPE), Math.round(sbCIN), Math.round(Tmucin), Math.round(mlCIN), Math.round(twCIN));
  // TODO was niet commentaar
  // delete PCCL_SB,TCCL_SB,PCCL_ML,TCCL_ML;
  return output;
}

function determineCCL (canvas, PSounding, TSounding, TdSounding, imgx, imgy) {
  mixr = mixrFromTd_Pres(TdSounding[0], PSounding[0]) * 1e-3;
  // Bepaal CCL/TCCL
  for (var i = 1; i < PSounding.length; i++) {
    coordsT = thetas_p2plot(TempPres(T_PRESR, PSounding[i], TSounding[i], 's'), PSounding[i], imgx, imgy);
    coordsM = thetas_p2plot(TempPres(T_PRESR, PSounding[i], mixr2Tdew(mixr, PSounding[i]), 's'), PSounding[i], imgx, imgy);
    if ((coordsT[0] - coordsM[0]) < 0) {
      coordsTmin1 = thetas_p2plot(TempPres(T_PRESR, PSounding[i - 1], TSounding[i], 's'), PSounding[i - 1], imgx, imgy);
      coordsMmin1 = thetas_p2plot(TempPres(T_PRESR, PSounding[i - 1], mixr2Tdew(mixr, PSounding[i - 1]), 's'), PSounding[i - 1], imgx, imgy);
      PCCL = (PSounding[i - 1] + ((PSounding[i] - PSounding[i - 1]) / 2));
      TCCL = (TSounding[i - 1] + ((TSounding[i] - TSounding[i - 1]) / 2));
      TdCCL = (TdSounding[i - 1] + ((TdSounding[i] - TdSounding[i - 1]) / 2));
      var CCLHeightFt = Math.round(100 * pres2fl(PCCL, PSounding[0]));
      var TCCLinCelsius = Math.round((TCCL - 273.15) * 100) / 100;
      var TdCCLinCelsius = Math.round((TdCCL - 273.15) * 100) / 100;
      var indexAbvCCL = (i);
      break;
    }
  }
// Bepalen EL's / en LFC
  coordsCCL = thetas_p2plot(TempPres(T_PRESR, PCCL, TCCL, 's'), PCCL, imgx, imgy);
  for (var n = indexAbvCCL; n < PSounding.length; n++) {
    coordsT = thetas_p2plot(TempPres(T_PRESR, PSounding[n], TSounding[n], 's'), PSounding[n], imgx, imgy);
    if ((coordsCCL[0] - coordsT[0]) < 0) {
      coordsTmin1 = thetas_p2plot(TempPres(T_PRESR, PSounding[n - 1], TSounding[n], 's'), PSounding[n - 1], imgx, imgy);
      PEL = (PSounding[n - 1] + ((PSounding[n] - PSounding[n - 1]) / 2));
      TEL = (TSounding[n - 1] + ((TSounding[n] - TSounding[n - 1]) / 2));
      var ELHeightFt = Math.round(100 * pres2fl(PEL, PSounding[0]));
      var TELinCelsius = Math.round((TEL - 273.15) * 100) / 100;
      break;
    }
  }
  coordsEL = thetas_p2plot(TempPres(T_PRESR, PEL, TEL, 's'), PEL, imgx, imgy);
  // alert('coordCCL0: '+coordsCCL[0]+'coordCCL1: '+coordsCCL[1]+'coordEL0: '+coordsEL[0]+'coordEL1: '+coordsEL[1]);
  // draw from CCL to EL
  /*
  var ctx = canvas.getContext('2d');
  if (!ctx.setLineDash) {ctx.setLineDash = function () {} } //als browser geen lineDash ondersteuning heeft, worden ze solid, maar zonder error
  if (!ctx.mozDash) {ctx.mozDash = function () {} }
  ctx.beginPath();
  ctx.setLineDash([5]);
  ctx.mozDash = [5];
  ctx.moveTo(coordsCCL[0],coordsCCL[1]);
  ctx.lineTo(coordsCCL[0],coordsEL[1]);
  ctx.strokeStyle='firebrick';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([0]);ctx.mozDash = [1,0];

  // draw CCL and EL identifiers
  coords_left_bottom=thetas_p2plot(T_THETAN,T_PRESX,canvasWidth,canvasHeight);
  ctx.strokeStyle='black';
  ctx.beginPath();
  ctx.moveTo(coords_left_bottom[0],coordsCCL[1]);
  ctx.lineTo(coords_left_bottom[0]+8,coordsCCL[1]);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  ctx.save();
  ctx.translate(coords_left_bottom[0]+10,coordsCCL[1]+3);
  ctx.font = "7pt verdana";
  ctx.fillText('CCL', 0, 0);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(coords_left_bottom[0],coordsEL[1]);
  ctx.lineTo(coords_left_bottom[0]+8,coordsEL[1]);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  ctx.save();
  ctx.translate(coords_left_bottom[0]+10,coordsEL[1]+3);
  ctx.fillText('EL', 0, 0);
  ctx.restore();
  */
  // alert('height: '+ELHeightFt+' TEL: '+TELinCelsius);
  var output = new Array(CCLHeightFt, TCCLinCelsius, ELHeightFt, TELinCelsius, PCCL, PEL, TdCCLinCelsius);
  return output;
}

/*
function calculateFt(ycoord,cellOI,jsonArray,imgx,imgy){
  //NIET AF!!!!!
  alert(ycoord);
  T_X   = 313.55;
  var plotH=cellOI;
  if(plotH<10){plotH='0'+plotH;}
  var tempArray = jsonArray["fcH"+fcH];  //set tempArray
  var PSounding=new Array();  for (var i=0; i<tempArray[0].P.length; i++){PSounding.push(tempArray[0].P[i]);}

  for (var ft=0; ft<=45000; ft+=125) {
    coords=thetas_p2plot(T_X, fl2pres((ft/0.3048),PSounding[0]),imgx,imgy);
    alert(ycoord+' '+coords[1]);
  }
}
*/

// Details Uurlijkse Hirlam stations ---egin <---
var latHirl = new Array();
var lonHirl = new Array();
var nameHirl = new Array();
latHirl['NL001'] = '52.93'; lonHirl['NL001'] = '4.74'; nameHirl['NL001'] = 'De Kooy EHKD';
latHirl['NL002'] = '52.12'; lonHirl['NL002'] = '5.18'; nameHirl['NL002'] = 'De Bilt EHDB';
latHirl['NL003'] = '53.10'; lonHirl['NL003'] = '6.57'; nameHirl['NL003'] = 'Eelde EHGG';
latHirl['NL004'] = '52.28'; lonHirl['NL004'] = '6.98'; nameHirl['NL004'] = 'Twenthe EHTW';
latHirl['NL005'] = '51.46'; lonHirl['NL005'] = '3.68'; nameHirl['NL005'] = 'Vlissingen EHFS';
latHirl['NL006'] = '50.95'; lonHirl['NL006'] = '5.76'; nameHirl['NL006'] = 'Beek EHBK';
latHirl['NL007'] = '51.95'; lonHirl['NL007'] = '4.42'; nameHirl['NL007'] = 'Rotterdam EHRD';
latHirl['NL008'] = '52.30'; lonHirl['NL008'] = '4.77'; nameHirl['NL008'] = 'Schiphol EHAM';
latHirl['NL009'] = '51.42'; lonHirl['NL009'] = '05.50'; nameHirl['NL009'] = 'Eindhoven EHEH';
latHirl['NL010'] = '53.26'; lonHirl['NL010'] = '5.79'; nameHirl['NL010'] = 'Leeuwarden EHLW';
latHirl['NL011'] = '51.54'; lonHirl['NL011'] = '4.89'; nameHirl['NL011'] = 'Gilze Rijen EHGR';
latHirl['NL012'] = '51.44'; lonHirl['NL012'] = '4.34'; nameHirl['NL012'] = 'Woensdrecht EHWO';
latHirl['NL013'] = '53.16'; lonHirl['NL013'] = '5.21'; nameHirl['NL013'] = 'Waddenzee';
latHirl['NL014'] = '52.13'; lonHirl['NL014'] = '04.00'; nameHirl['NL014'] = 'Scheveningen';
latHirl['NL015'] = '52.69'; lonHirl['NL015'] = '5.48'; nameHirl['NL015'] = 'IJsselmeer';
latHirl['NL016'] = '53.44'; lonHirl['NL016'] = '5.36'; nameHirl['NL016'] = 'Terschelling';
latHirl['NL017'] = '52.47'; lonHirl['NL017'] = '5.54'; nameHirl['NL017'] = 'Lelystad EHLE';
latHirl['NL018'] = '51.71'; lonHirl['NL018'] = '5.65'; nameHirl['NL018'] = 'Volkel EHVK';
latHirl['NL019'] = '51.21'; lonHirl['NL019'] = '03.90'; nameHirl['NL019'] = 'Antwerpen (BE)';
latHirl['NL020'] = '53.54'; lonHirl['NL020'] = '6.47'; nameHirl['NL020'] = 'Huibertsgat';
latHirl['NL021'] = '53.19'; lonHirl['NL021'] = '7.15'; nameHirl['NL021'] = 'Nieuw Beerta';
latHirl['NL022'] = '52.72'; lonHirl['NL022'] = '5.84'; nameHirl['NL022'] = 'Marknesse';
latHirl['NL023'] = '52.14'; lonHirl['NL023'] = '4.52'; nameHirl['NL023'] = 'Valkenburg EHVB';
latHirl['NL024'] = '51.17'; lonHirl['NL024'] = '5.71'; nameHirl['NL024'] = 'Ell';
latHirl['NL025'] = '51.49'; lonHirl['NL025'] = '6.21'; nameHirl['NL025'] = 'Arcen';
latHirl['NL026'] = '51.95'; lonHirl['NL026'] = '4.93'; nameHirl['NL026'] = 'Cabauw';
latHirl['NL027'] = '54.83'; lonHirl['NL027'] = '4.67'; nameHirl['NL027'] = 'EHFD';
latHirl['NL028'] = '53.21'; lonHirl['NL028'] = '3.15'; nameHirl['NL028'] = 'EHJR';
latHirl['NL029'] = '53.63'; lonHirl['NL029'] = '4.93'; nameHirl['NL029'] = 'EHMG';
latHirl['NL030'] = '53.54'; lonHirl['NL030'] = '5.94'; nameHirl['NL030'] = 'EHMA';
latHirl['NL031'] = '53.23'; lonHirl['NL031'] = '3.68'; nameHirl['NL031'] = 'EHKV';
latHirl['NL032'] = '54.12'; lonHirl['NL032'] = '3.94'; nameHirl['NL032'] = 'EHFZ';
latHirl['NL033'] = '53.36'; lonHirl['NL033'] = '2.88'; nameHirl['NL033'] = 'EHDV';
latHirl['NL034'] = '53.87'; lonHirl['NL034'] = '2.94'; nameHirl['NL034'] = 'EHJA';
latHirl['NL035'] = '52.05'; lonHirl['NL035'] = '3.29'; nameHirl['NL035'] = 'EHSA EuroplatHirlform';
latHirl['NL036'] = '51.99'; lonHirl['NL036'] = '03.60'; nameHirl['NL036'] = 'LE Goeree';
latHirl['NL037'] = '56.54'; lonHirl['NL037'] = '3.16'; nameHirl['NL037'] = 'ENEK Ecofysk (NO)';
latHirl['NL038'] = '50.87'; lonHirl['NL038'] = '00.33'; nameHirl['NL038'] = 'West End (UK)';
latHirl['NL039'] = '51.17'; lonHirl['NL039'] = '-1.82'; nameHirl['NL039'] = 'Larkhill (UK)';
latHirl['NL040'] = '48.74'; lonHirl['NL040'] = '2.03'; nameHirl['NL040'] = 'Parijs (FR)';
latHirl['NL041'] = '48.43'; lonHirl['NL041'] = '-4.46'; nameHirl['NL041'] = 'Brest (FR)';
latHirl['NL042'] = '44.87'; lonHirl['NL042'] = '-0.69'; nameHirl['NL042'] = 'Bordeaux (FR)';
latHirl['NL043'] = '48.74'; lonHirl['NL043'] = '6.24'; nameHirl['NL043'] = 'Nancy (FR)';
latHirl['NL044'] = '54.48'; lonHirl['NL044'] = '9.57'; nameHirl['NL044'] = 'Schleswig (DL)';
latHirl['NL045'] = '53.38'; lonHirl['NL045'] = '7.26'; nameHirl['NL045'] = 'Emden (DL)';
latHirl['NL046'] = '52.75'; lonHirl['NL046'] = '7.25'; nameHirl['NL046'] = 'Meppen (DL)';
latHirl['NL047'] = '51.42'; lonHirl['NL047'] = '7.01'; nameHirl['NL047'] = 'Essen (DL)';
latHirl['NL048'] = '48.80'; lonHirl['NL048'] = '9.14'; nameHirl['NL048'] = 'Stuttgart (DL)';
latHirl['NL049'] = '51.11'; lonHirl['NL049'] = '02.70'; nameHirl['NL049'] = 'Oostende EBOS (BE)';
latHirl['NL050'] = '50.72'; lonHirl['NL050'] = '4.82'; nameHirl['NL050'] = 'Beauvechain EBBE (BE)';
latHirl['NL051'] = '50.45'; lonHirl['NL051'] = '6.16'; nameHirl['NL051'] = 'Elsenborn EBLB (BE)';
// Details Uurlijkse Hirlam stations ---> end <---
