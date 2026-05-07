/**
 * Die-line Generator for BoxFox
 * Generates an SVG string for technical packaging design templates.
 */

export const generateMailerDieLine = (l, w, h, unit = 'in') => {
    // 96 DPI for web/Illustrator standard
    const pxi = unit === 'in' ? 96 : 3.7795;

    // Convert dimensions to pixels
    const L = l * pxi;
    const W = w * pxi;
    const H = h * pxi;
    const tab = 20; // 20px tab for tucking

    // Layout (Vertical Stack):
    // 1. Top Flap (H/2)
    // 2. Top Lid (W)
    // 3. Back Wall (H)
    // 4. Base (W)
    // 5. Front Wall (H)
    // Side Walls attached to Base

    const totalHeight = 2 * W + 2 * H + (H / 2);
    const totalWidth = L + 2 * H;

    // Anchor offset
    const OX = H;
    const OY = H / 2;

    const cutStyle = 'stroke="#FF0000" stroke-width="1" fill="none"';
    const scoreStyle = 'stroke="#0000FF" stroke-width="1" stroke-dasharray="8,4" fill="none"';
    const textStyle = 'fill="#111" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="900"';

    let svg = `<svg width="${totalWidth + 100}" height="${totalHeight + 100}" viewBox="-50 -50 ${totalWidth + 100} ${totalHeight + 100}" xmlns="http://www.w3.org/2000/svg">`;

    // 1. CUT LINES (OUTLINE)
    svg += `<!-- Outline Cut -->
    <path d="
        M ${OX},${OY} 
        L ${OX + L},${OY} 
        L ${OX + L},${OY + W} 
        L ${OX + L + H},${OY + W} 
        L ${OX + L + H},${OY + W + H}
        L ${OX + L + H},${OY + W + H + W}
        L ${OX + L},${OY + W + H + W}
        L ${OX + L},${OY + W + H + W + H}
        L ${OX},${OY + W + H + W + H}
        L ${OX},${OY + W + H + W}
        L ${OX - H},${OY + W + H + W}
        L ${OX - H},${OY + W + H}
        L ${OX - H},${OY + W}
        L ${OX},${OY + W}
        Z
    " ${cutStyle} />`;

    // 2. SCORE LINES (FOLDS)
    svg += `<!-- Fold Lines -->
    <line x1="${OX}" y1="${OY + W}" x2="${OX + L}" y2="${OY + W}" ${scoreStyle} />
    <line x1="${OX}" y1="${OY + W + H}" x2="${OX + L}" y2="${OY + W + H}" ${scoreStyle} />
    <line x1="${OX}" y1="${OY + W + H + W}" x2="${OX + L}" y2="${OY + W + H + W}" ${scoreStyle} />
    <line x1="${OX}" y1="${OY + W}" x2="${OX}" y2="${OY + W + H + W}" ${scoreStyle} />
    <line x1="${OX + L}" y1="${OY + W}" x2="${OX + L}" y2="${OY + W + H + W}" ${scoreStyle} />`;

    // 3. LABELS
    // Use centered text for labels
    const labelX = OX + L / 2;
    svg += `<text x="${labelX}" y="${OY + W / 2}" ${textStyle} text-anchor="middle">TOP LID</text>`;
    svg += `<text x="${labelX}" y="${OY + W + H / 2}" ${textStyle} text-anchor="middle">BACK WALL</text>`;
    svg += `<text x="${labelX}" y="${OY + W + H + W / 2}" ${textStyle} text-anchor="middle">BASE</text>`;
    svg += `<text x="${labelX}" y="${OY + W + H + W + H / 2}" ${textStyle} text-anchor="middle">FRONT WALL</text>`;

    // Side Wall Labels (rotated)
    svg += `<text x="${OX - H / 2}" y="${OY + W + H + W / 2}" ${textStyle} text-anchor="middle" transform="rotate(-90 ${OX - H / 2},${OY + W + H + W / 2})">SIDE WALL</text>`;
    svg += `<text x="${OX + L + H / 2}" y="${OY + W + H + W / 2}" ${textStyle} text-anchor="middle" transform="rotate(90 ${OX + L + H / 2},${OY + W + H + W / 2})">SIDE WALL</text>`;

    // DIMENSIONS INFO
    svg += `<g transform="translate(0, ${totalHeight + 20})">
        <text x="0" y="0" font-family="Arial" font-size="14" font-weight="bold" fill="#000">BoxFox Technical Die-Line Template</text>
        <text x="0" y="20" font-family="Arial" font-size="12" fill="#666">Dimensions: ${l} x ${w} x ${h} ${unit}</text>
        <text x="0" y="35" font-family="Arial" font-size="10" fill="#FF0000">Red Line: CUT (Die-Cut)</text>
        <text x="0" y="50" font-family="Arial" font-size="10" fill="#0000FF">Blue Dash: SCORE (Fold)</text>
    </g>`;

    svg += '</svg>';
    return svg;
};

export const downloadDieLine = (l, w, h, unit = 'in', fileName = 'BoxFox-Dieline.svg') => {
    const svgContent = generateMailerDieLine(l, w, h, unit);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
