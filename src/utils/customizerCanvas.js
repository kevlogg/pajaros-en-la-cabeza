/* ==========================================================================
   CANVAS LIVE MOCKUP ENGINE - PÁJAROS EN LA CABEZA
   ========================================================================== */

/**
 * Draws rounded rectangle helper
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * Draws image with cover fit inside rect
 */
function drawImageCover(ctx, img, x, y, w, h) {
  if (!img || !img.width || !img.height) return;
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * Draw Garment / Item Mockup Base
 */
export function drawProductBase(ctx, productType, colorHex, w, h) {
  ctx.save();

  // Background subtle canvas
  ctx.fillStyle = '#EFECE6';
  ctx.fillRect(0, 0, w, h);

  // Soft studio vignette shadow
  const grad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, w / 1.1);
  grad.addColorStop(0, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(0,0,0,0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  if (productType === 'remera') {
    // REMERA MOCKUP
    const topY = 70;
    const bodyW = 320;
    const bodyH = 430;
    const sleeveW = 110;
    const sleeveH = 130;

    // Garment Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 14;

    ctx.fillStyle = colorHex;
    ctx.strokeStyle = '#0D0D0D';
    ctx.lineWidth = 3.5;

    // Full T-Shirt Path
    ctx.beginPath();
    // Neck collar left
    ctx.moveTo(cx - 75, topY + 25);
    // Left Shoulder
    ctx.lineTo(cx - 170, topY + 65);
    // Left Sleeve outer
    ctx.lineTo(cx - 245, topY + 160);
    // Left Sleeve cuff
    ctx.lineTo(cx - 185, topY + 215);
    // Left armpit
    ctx.lineTo(cx - 150, topY + 140);
    // Left torso side
    ctx.lineTo(cx - 145, topY + bodyH);
    // Bottom hem
    ctx.quadraticCurveTo(cx, topY + bodyH + 18, cx + 145, topY + bodyH);
    // Right torso side
    ctx.lineTo(cx + 150, topY + 140);
    // Right armpit
    ctx.lineTo(cx + 185, topY + 215);
    // Right Sleeve cuff
    ctx.lineTo(cx + 245, topY + 160);
    // Right Shoulder
    ctx.lineTo(cx + 170, topY + 65);
    // Neck collar right
    ctx.lineTo(cx + 75, topY + 25);
    // Front neck collar curve
    ctx.quadraticCurveTo(cx, topY + 75, cx - 75, topY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Ribbed Collar Inner & Outer
    ctx.beginPath();
    ctx.ellipse(cx, topY + 32, 75, 24, 0, 0, Math.PI);
    ctx.strokeStyle = '#0D0D0D';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Collar ribbing detail
    ctx.beginPath();
    ctx.ellipse(cx, topY + 36, 70, 20, 0, 0, Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle Fabric Folds
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 2;
    // Left armpit fold
    ctx.beginPath();
    ctx.moveTo(cx - 150, topY + 140);
    ctx.quadraticCurveTo(cx - 120, topY + 170, cx - 110, topY + 220);
    ctx.stroke();
    // Right armpit fold
    ctx.beginPath();
    ctx.moveTo(cx + 150, topY + 140);
    ctx.quadraticCurveTo(cx + 120, topY + 170, cx + 110, topY + 220);
    ctx.stroke();
    // Bottom hem seam
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.quadraticCurveTo(cx, topY + bodyH + 10, cx + 140, topY + bodyH - 5);
    ctx.stroke();

  } else if (productType === 'hoodie') {
    // HOODIE MOCKUP
    const topY = 65;
    const bodyH = 435;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 16;

    ctx.fillStyle = colorHex;
    ctx.strokeStyle = '#0D0D0D';
    ctx.lineWidth = 3.5;

    // Body & Oversize sleeves
    ctx.beginPath();
    ctx.moveTo(cx - 90, topY + 40);
    ctx.lineTo(cx - 185, topY + 80);
    ctx.lineTo(cx - 260, topY + 220);
    ctx.lineTo(cx - 200, topY + 270);
    ctx.lineTo(cx - 165, topY + 180);
    ctx.lineTo(cx - 160, topY + bodyH);
    ctx.quadraticCurveTo(cx, topY + bodyH + 15, cx + 160, topY + bodyH);
    ctx.lineTo(cx + 165, topY + 180);
    ctx.lineTo(cx + 200, topY + 270);
    ctx.lineTo(cx + 260, topY + 220);
    ctx.lineTo(cx + 185, topY + 80);
    ctx.lineTo(cx + 90, topY + 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Hood Shape
    ctx.beginPath();
    ctx.moveTo(cx - 95, topY + 45);
    ctx.quadraticCurveTo(cx - 85, topY - 30, cx, topY - 35);
    ctx.quadraticCurveTo(cx + 85, topY - 30, cx + 95, topY + 45);
    ctx.quadraticCurveTo(cx + 40, topY + 85, cx, topY + 70);
    ctx.quadraticCurveTo(cx - 40, topY + 85, cx - 95, topY + 45);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.stroke();

    // Draw Cords
    ctx.strokeStyle = '#0D0D0D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 30, topY + 75);
    ctx.quadraticCurveTo(cx - 45, topY + 120, cx - 35, topY + 165);
    ctx.stroke();
    // Metal cord tip
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(cx - 37, topY + 165, 5, 12);
    ctx.strokeRect(cx - 37, topY + 165, 5, 12);

    ctx.beginPath();
    ctx.moveTo(cx + 30, topY + 75);
    ctx.quadraticCurveTo(cx + 45, topY + 120, cx + 35, topY + 165);
    ctx.stroke();
    ctx.fillRect(cx + 33, topY + 165, 5, 12);
    ctx.strokeRect(cx + 33, topY + 165, 5, 12);

    // Kangaroo Pocket
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.moveTo(cx - 105, topY + 325);
    ctx.lineTo(cx - 135, topY + 415);
    ctx.lineTo(cx + 135, topY + 415);
    ctx.lineTo(cx + 105, topY + 325);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (productType === 'taza') {
    // MUG MOCKUP
    const mugW = 230;
    const mugH = 290;
    const mugY = 150;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 20;

    // Handle
    ctx.beginPath();
    ctx.moveTo(cx + mugW / 2 - 10, mugY + 40);
    ctx.bezierCurveTo(cx + mugW / 2 + 105, mugY + 50, cx + mugW / 2 + 105, mugY + mugH - 70, cx + mugW / 2 - 10, mugY + mugH - 60);
    ctx.lineWidth = 32;
    ctx.strokeStyle = colorHex;
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#0D0D0D';
    ctx.stroke();

    // Mug Body Cylinder
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.moveTo(cx - mugW / 2, mugY + 25);
    ctx.lineTo(cx - mugW / 2, mugY + mugH - 20);
    ctx.quadraticCurveTo(cx, mugY + mugH + 18, cx + mugW / 2, mugY + mugH - 20);
    ctx.lineTo(cx + mugW / 2, mugY + 25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Top Rim Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, mugY + 25, mugW / 2, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();

    // Inner rim depth
    ctx.beginPath();
    ctx.ellipse(cx, mugY + 25, mugW / 2 - 10, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D6D6D6';
    ctx.fill();

  } else if (productType === 'totebag') {
    // TOTEBAG MOCKUP
    const bagW = 280;
    const bagH = 320;
    const bagY = 190;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 16;

    // Straps
    ctx.beginPath();
    ctx.moveTo(cx - 75, bagY + 15);
    ctx.bezierCurveTo(cx - 75, bagY - 145, cx - 15, bagY - 145, cx - 15, bagY + 15);
    ctx.lineWidth = 20;
    ctx.strokeStyle = colorHex;
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#0D0D0D';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 15, bagY + 15);
    ctx.bezierCurveTo(cx + 15, bagY - 145, cx + 75, bagY - 145, cx + 75, bagY + 15);
    ctx.lineWidth = 20;
    ctx.strokeStyle = colorHex;
    ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#0D0D0D';
    ctx.stroke();

    // Bag body
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.moveTo(cx - bagW / 2, bagY);
    ctx.lineTo(cx - bagW / 2 - 10, bagY + bagH);
    ctx.quadraticCurveTo(cx, bagY + bagH + 12, cx + bagW / 2 + 10, bagY + bagH);
    ctx.lineTo(cx + bagW / 2, bagY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bag top hem
    ctx.beginPath();
    ctx.moveTo(cx - bagW / 2, bagY);
    ctx.lineTo(cx + bagW / 2, bagY);
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Returns the print bounding box for a given product
 */
export function getProductPrintArea(productType, w, h) {
  const cx = w / 2;
  switch (productType) {
    case 'hoodie':
      return { cx, cy: 220, w: 185, h: 220 };
    case 'taza':
      return { cx: cx - 10, cy: 290, w: 155, h: 185 };
    case 'totebag':
      return { cx, cy: 345, w: 195, h: 230 };
    case 'remera':
    default:
      return { cx, cy: 250, w: 195, h: 240 };
  }
}

/**
 * Render Specific Graphic Template onto the Print Area
 */
export function drawTemplateDesign(ctx, template, fieldValues, userImage, printArea, colorHex, textInvert) {
  ctx.save();

  const { cx, cy, w, h } = printArea;
  const isDarkBase = textInvert || colorHex === '#121212' || colorHex === '#0D0D0D';
  const primaryTextColor = isDarkBase ? '#FFFFFF' : '#0D0D0D';
  const accentYellow = '#FFE600';
  const accentMagenta = '#FF0066';

  switch (template.designStyle) {
    case 'polaroid': {
      // POLAROID STYLE
      const cardW = Math.min(w * 0.94, 185);
      const cardH = cardW * 1.25;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2 + 10;

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // White paper card
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      roundRect(ctx, cardX, cardY, cardW, cardH, 4, true, true);

      ctx.shadowColor = 'transparent';

      // Photo Frame Window
      const photoPad = cardW * 0.08;
      const photoW = cardW - photoPad * 2;
      const photoH = photoW;
      const photoX = cardX + photoPad;
      const photoY = cardY + photoPad;

      ctx.fillStyle = '#E8E8E8';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 1.5;
      roundRect(ctx, photoX, photoY, photoW, photoH, 2, true, true);

      // Draw Photo or Placeholder
      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();
        drawImageCover(ctx, userImage, photoX, photoY, photoW, photoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#888888';
        ctx.font = 'bold 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 FOTO AQUÍ', photoX + photoW / 2, photoY + photoH / 2 - 4);
        ctx.font = '8px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('(Cargar foto abajo)', photoX + photoW / 2, photoY + photoH / 2 + 10);
      }

      // Decorative Heart / Clip pin at top
      ctx.fillStyle = accentMagenta;
      ctx.beginPath();
      ctx.arc(cardX + cardW / 2, cardY + 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Names Text
      const names = fieldValues.names || template.fields[0]?.defaultValue || 'Nuestra Historia';
      ctx.fillStyle = '#0D0D0D';
      ctx.font = `800 ${Math.round(cardW * 0.085)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(names, cardX + cardW / 2, photoY + photoH + cardW * 0.12);

      // Date Text
      const dateText = fieldValues.date || template.fields[1]?.defaultValue || 'Por siempre';
      ctx.fillStyle = '#555555';
      ctx.font = `600 ${Math.round(cardW * 0.065)}px "Space Mono", monospace`;
      ctx.fillText(dateText, cardX + cardW / 2, photoY + photoH + cardW * 0.21);

      break;
    }

    case 'music_player': {
      // SPOTIFY / STREAMING MUSIC PLAYER
      const cardW = Math.min(w * 0.96, 185);
      const cardH = cardW * 1.28;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2 + 5;

      // Card Background (Neo-Brutalist Box)
      ctx.fillStyle = isDarkBase ? '#1E1E1E' : '#FFFFFF';
      ctx.strokeStyle = isDarkBase ? '#FFE600' : '#0D0D0D';
      ctx.lineWidth = 3;
      roundRect(ctx, cardX, cardY, cardW, cardH, 8, true, true);

      // Album Art Window
      const artMargin = 12;
      const artW = cardW - artMargin * 2;
      const artH = artW * 0.85;
      const artX = cardX + artMargin;
      const artY = cardY + artMargin;

      ctx.fillStyle = isDarkBase ? '#2A2A2A' : '#E8E8E8';
      ctx.strokeStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.lineWidth = 2;
      roundRect(ctx, artX, artY, artW, artH, 6, true, true);

      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(artX, artY, artW, artH);
        ctx.clip();
        drawImageCover(ctx, userImage, artX, artY, artW, artH);
        ctx.restore();
      } else {
        ctx.fillStyle = isDarkBase ? '#888' : '#777';
        ctx.font = 'bold 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎵 PORTADA DEL ÁLBUM', artX + artW / 2, artY + artH / 2);
      }

      // Song Title
      const songTitle = fieldValues.songTitle || template.fields[0]?.defaultValue || 'Nuestra Canción';
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.font = `800 ${Math.round(cardW * 0.08)}px "Space Grotesk", sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(songTitle, artX, artY + artH + 18, artW - 20);

      // Heart Icon next to title
      ctx.fillStyle = accentMagenta;
      ctx.font = '14px sans-serif';
      ctx.fillText('♥', artX + artW - 14, artY + artH + 18);

      // Artist or Dedication
      const artist = fieldValues.artistName || template.fields[1]?.defaultValue || 'Para vos';
      ctx.fillStyle = isDarkBase ? '#AAAAAA' : '#555555';
      ctx.font = `600 ${Math.round(cardW * 0.058)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(artist, artX, artY + artH + 32, artW);

      // Timeline Progress Bar
      const barY = artY + artH + 45;
      ctx.fillStyle = isDarkBase ? '#444' : '#DDD';
      roundRect(ctx, artX, barY, artW, 4, 2, true, false);

      ctx.fillStyle = accentYellow;
      roundRect(ctx, artX, barY, artW * 0.65, 4, 2, true, false);

      // Progress point
      ctx.fillStyle = isDarkBase ? '#FFF' : '#0D0D0D';
      ctx.beginPath();
      ctx.arc(artX + artW * 0.65, barY + 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Controls (Icons representation)
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.font = '10px "Space Mono", monospace';
      ctx.textAlign = 'center';
      const controlsY = barY + 22;
      ctx.fillText('⏮    ▶    ⏭', artX + artW / 2, controlsY);

      break;
    }

    case 'vintage_year': {
      // VINTAGE UNIVERSITY / ATHLETIC YEAR
      const year = fieldValues.birthYear || template.fields[0]?.defaultValue || '1998';
      const name = (fieldValues.honoreeName || template.fields[1]?.defaultValue || 'JULIETA').toUpperCase();
      const legend = fieldValues.legend || template.fields[2]?.defaultValue || 'AGED TO PERFECTION';

      // Top Arc / Ribbon
      ctx.fillStyle = isDarkBase ? accentYellow : '#0D0D0D';
      ctx.font = '800 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ EDICIÓN LIMITADA ★', cx, cy - 65);

      // Name Banner Box
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : accentYellow;
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      roundRect(ctx, cx - 80, cy - 50, 160, 24, 0, true, true);

      ctx.fillStyle = '#0D0D0D';
      ctx.font = '800 13px "Space Grotesk", sans-serif';
      ctx.fillText(name, cx, cy - 34);

      // Giant Year Numbers
      ctx.font = '900 68px "Space Grotesk", sans-serif';
      // 3D Offset Shadow
      ctx.fillStyle = isDarkBase ? accentMagenta : '#0D0D0D';
      ctx.fillText(year, cx + 3, cy + 33);

      ctx.fillStyle = isDarkBase ? '#FFFFFF' : accentYellow;
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      ctx.fillText(year, cx, cy + 30);
      ctx.strokeText(year, cx, cy + 30);

      // Bottom Banner & Quality Seal
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.font = '700 8.5px "Space Mono", monospace';
      ctx.fillText(legend, cx, cy + 62);

      ctx.font = '10px sans-serif';
      ctx.fillText('✦  100% ORIGINAL QUALITY  ✦', cx, cy + 78);

      break;
    }

    case 'pet_badge': {
      // PET PORTRAIT BADGE
      const badgeR = 60;
      const petName = (fieldValues.petName || template.fields[0]?.defaultValue || 'SIMÓN').toUpperCase();
      const petTitle = fieldValues.petTitle || template.fields[1]?.defaultValue || 'EL REY DE LA CASA';

      // Outer Crest Circle
      ctx.fillStyle = isDarkBase ? '#242424' : '#FFFFFF';
      ctx.strokeStyle = isDarkBase ? accentYellow : '#0D0D0D';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, badgeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Photo circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy - 10, badgeR - 6, 0, Math.PI * 2);
      ctx.clip();

      if (userImage) {
        drawImageCover(ctx, userImage, cx - badgeR + 6, cy - 10 - badgeR + 6, (badgeR - 6) * 2, (badgeR - 6) * 2);
      } else {
        ctx.fillStyle = isDarkBase ? '#333' : '#E0E0E0';
        ctx.fill();
        ctx.fillStyle = isDarkBase ? '#FFF' : '#333';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐾 FOTO MASCOTA', cx, cy - 10);
      }
      ctx.restore();

      // Inner stroke
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, badgeR - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Ribbon / Name Banner
      ctx.fillStyle = accentYellow;
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      roundRect(ctx, cx - 75, cy + 42, 150, 26, 4, true, true);

      ctx.fillStyle = '#0D0D0D';
      ctx.font = '900 14px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🐾 ${petName} 🐾`, cx, cy + 60);

      // Subtitle
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.font = '700 8.5px "Space Mono", monospace';
      ctx.fillText(petTitle, cx, cy + 82);

      break;
    }

    case 'editorial_bff': {
      // EDITORIAL / POSTER BESTIES
      const cardW = Math.min(w * 0.95, 180);
      const cardH = cardW * 1.25;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      ctx.fillStyle = isDarkBase ? '#121212' : '#FFFFFF';
      ctx.strokeStyle = isDarkBase ? accentMagenta : '#0D0D0D';
      ctx.lineWidth = 3;
      roundRect(ctx, cardX, cardY, cardW, cardH, 4, true, true);

      // Header Tag
      ctx.fillStyle = accentYellow;
      ctx.fillRect(cardX, cardY, cardW, 20);
      ctx.strokeRect(cardX, cardY, cardW, 20);

      ctx.fillStyle = '#0D0D0D';
      ctx.font = '800 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ PARTNERS IN CRIME ★', cx, cardY + 14);

      // Photo Window
      const photoPad = 10;
      const photoW = cardW - photoPad * 2;
      const photoH = cardH - 65;
      const photoX = cardX + photoPad;
      const photoY = cardY + 28;

      ctx.fillStyle = '#E5E5E5';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      roundRect(ctx, photoX, photoY, photoW, photoH, 2, true, true);

      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();
        drawImageCover(ctx, userImage, photoX, photoY, photoW, photoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#666';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 FOTO BESTIES', photoX + photoW / 2, photoY + photoH / 2);
      }

      // Squad Names
      const names = fieldValues.squadNames || template.fields[0]?.defaultValue || 'VALE & MARTU';
      ctx.fillStyle = isDarkBase ? '#FFFFFF' : '#0D0D0D';
      ctx.font = '900 12px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(names, cx, cardY + cardH - 20);

      // Phrase
      const phrase = fieldValues.squadPhrase || template.fields[1]?.defaultValue || 'SINCE 2018';
      ctx.fillStyle = isDarkBase ? accentYellow : accentMagenta;
      ctx.font = '700 8px "Space Mono", monospace';
      ctx.fillText(phrase, cx, cardY + cardH - 8);

      break;
    }

    case 'award_badge': {
      // NUMBER 1 MOM / DAD / MENTOR
      const cardW = Math.min(w * 0.94, 180);
      const cardH = cardW * 1.25;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      // Crown / Trophy top
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', cx, cardY + 16);

      // Card frame
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      roundRect(ctx, cardX, cardY + 24, cardW, cardH - 24, 6, true, true);

      // Photo
      const photoPad = 12;
      const photoW = cardW - photoPad * 2;
      const photoH = photoW * 0.85;
      const photoX = cardX + photoPad;
      const photoY = cardY + 36;

      ctx.fillStyle = '#ECECEC';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      roundRect(ctx, photoX, photoY, photoW, photoH, 4, true, true);

      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();
        drawImageCover(ctx, userImage, photoX, photoY, photoW, photoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#777';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📷 FOTO FAMILIAR', photoX + photoW / 2, photoY + photoH / 2);
      }

      // Honoree Title
      const honoree = fieldValues.honoree || template.fields[0]?.defaultValue || 'EL MEJOR PAPÁ';
      ctx.fillStyle = '#0D0D0D';
      ctx.font = '800 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(honoree, cx, photoY + photoH + 20);

      // From who
      const fromWho = fieldValues.fromWho || template.fields[1]?.defaultValue || 'Con amor siempre';
      ctx.fillStyle = '#555555';
      ctx.font = '600 8.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(fromWho, cx, photoY + photoH + 34);

      break;
    }

    case 'minimalist_monogram': {
      // MINIMALIST MONOGRAM & DATE
      const monogram = fieldValues.monogram || template.fields[0]?.defaultValue || 'M ♥ J';
      const subDate = fieldValues.subDate || template.fields[1]?.defaultValue || '20 . 11 . 2021';
      const loc = fieldValues.location || template.fields[2]?.defaultValue || 'Donde todo empezó';

      ctx.fillStyle = primaryTextColor;
      ctx.textAlign = 'center';

      // Monogram
      ctx.font = '800 36px "Space Grotesk", sans-serif';
      ctx.fillText(monogram, cx, cy - 15);

      // Thin separator line
      ctx.strokeStyle = isDarkBase ? accentYellow : '#0D0D0D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy);
      ctx.lineTo(cx + 50, cy);
      ctx.stroke();

      // Date
      ctx.font = '700 11px "Space Mono", monospace';
      ctx.fillText(subDate, cx, cy + 22);

      // Location / Subtitle
      ctx.font = 'italic 500 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = isDarkBase ? '#CCCCCC' : '#555555';
      ctx.fillText(loc, cx, cy + 38);

      break;
    }

    case 'pop_birthday': {
      // POP BIRTHDAY PARTY
      const cardW = Math.min(w * 0.94, 180);
      const cardH = cardW * 1.25;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      // Crown
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', cx, cardY + 12);

      // Pop Title Box
      ctx.fillStyle = accentMagenta;
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2.5;
      const title = fieldValues.starTitle || template.fields[0]?.defaultValue || "IT'S MY BIRTHDAY";
      roundRect(ctx, cardX, cardY + 20, cardW, 22, 2, true, true);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 10.5px "Space Grotesk", sans-serif';
      ctx.fillText(title, cx, cardY + 35);

      // Photo
      const photoPad = 8;
      const photoW = cardW - photoPad * 2;
      const photoH = cardH - 65;
      const photoX = cardX + photoPad;
      const photoY = cardY + 48;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#0D0D0D';
      ctx.lineWidth = 2;
      roundRect(ctx, photoX, photoY, photoW, photoH, 2, true, true);

      if (userImage) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoW, photoH);
        ctx.clip();
        drawImageCover(ctx, userImage, photoX, photoY, photoW, photoH);
        ctx.restore();
      } else {
        ctx.fillStyle = '#666';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('📷 FOTO CUMPLEAÑOS', photoX + photoW / 2, photoY + photoH / 2);
      }

      // Name & Age
      const nameAge = fieldValues.starNameAge || template.fields[1]?.defaultValue || 'CAMILA • 25';
      ctx.fillStyle = isDarkBase ? accentYellow : '#0D0D0D';
      ctx.font = '800 11.5px "Space Grotesk", sans-serif';
      ctx.fillText(nameAge, cx, cardY + cardH + 12);

      break;
    }

    default: {
      // Fallback simple design
      ctx.fillStyle = primaryTextColor;
      ctx.font = '800 16px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(template.name, cx, cy);
      break;
    }
  }

  ctx.restore();
}

/**
 * Main function to render composite preview onto canvas
 */
export function renderTemplatePreview(canvas, { template, productType, color, fieldValues, userImage }) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // 1. Clear
  ctx.clearRect(0, 0, w, h);

  // 2. Draw Product garment/item
  drawProductBase(ctx, productType, color.hex, w, h);

  // 3. Get Print Bounding Box
  const printArea = getProductPrintArea(productType, w, h);

  // 4. Draw Template design
  drawTemplateDesign(ctx, template, fieldValues, userImage, printArea, color.hex, color.textInvert);
}

/**
 * Trigger download of the canvas
 */
export function downloadCanvas(canvas, filename = 'mi-regalo-personalizado.png') {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 0.95);
  link.click();
}
