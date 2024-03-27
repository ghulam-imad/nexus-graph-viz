import { Settings } from "sigma/settings";
import { EdgeDisplayData, NodeDisplayData, PartialButFor, PlainObject } from "sigma/types";

export function drawLabel(
    context: CanvasRenderingContext2D,
    data: PlainObject,
    settings: Settings,
): void {
    if (!data.label) return;

    const ratio = (data.size / settings.labelRenderedSizeThreshold);
    const size = settings.labelSize * ratio;
    const font = settings.labelFont;
    const weight = "normal";

    const padding_y = 0 * ratio;
    const padding_x = 0 * ratio;
    const line_gap = 2 * ratio;
    const bgColor = "#ffffff00";
    const txColor = settings.labelColor.color || "#333";
    context.textBaseline = 'top';

    const fontSizeRelative = [-2, 0];
    const text = [data.vtype, data.label];

    let next_y_pos = data.y + (data.size) + line_gap;

    text.forEach((t, idx) => {
        context.font = `${weight} ${size + (fontSizeRelative?.[idx] || 0)}px ${font}`;
        const tm = context.measureText(t);
        const text_height = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent + (padding_y * 2);
        const text_width = tm.width + (padding_x * 2);

        context.fillStyle = bgColor;
        context.fillRect(
            data.x - text_width / 2,
            next_y_pos,
            text_width,
            text_height
        );

        context.fillStyle = txColor;
        context.fillText(
            t,
            data.x - (text_width / 2) + (padding_x),
            next_y_pos + tm.fontBoundingBoxAscent + (padding_y),
        );

        next_y_pos += text_height + line_gap;
    });
}

export function drawHover(
    context: CanvasRenderingContext2D,
    data: PlainObject,
    settings: Settings,
): void {
    if (!data.label) return;

    const ratio = (data.size / settings.labelRenderedSizeThreshold);
    const size = settings.labelSize * ratio;
    const font = settings.labelFont;
    const weight = "normal";

    const padding_y = 0 * ratio;
    const padding_x = 5 * ratio;
    const line_gap = 2 * ratio;
    const rect_rad = 2 * ratio;
    const bgColor = "#ffffff";
    const txColor = settings.labelColor.color || "#333";
    context.textBaseline = 'top';

    const fontSizeRelative = [-2, 0];
    const text = [data.vtype, data.label];

    let next_y_pos = data.y + (data.size) + line_gap;

    context.fillStyle = bgColor;

    let all_w: number[] = [];
    let all_h: number[] = [];
    text.forEach((t, idx) => {
        context.font = `${weight} ${size + (fontSizeRelative?.[idx] || 0)}px ${font}`;
        const tm = context.measureText(t);
        const text_height = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent + (padding_y * 2);
        const text_width = tm.width + (padding_x * 2);
        all_h.push(text_height);
        all_w.push(text_width);
    });
    const endAngle = Math.asin((data.size - line_gap) / (data.size+line_gap));
    const startAngle = Math.PI - endAngle;
    const maxW = Math.max(...all_w);
    const allH = all_h.reduce((a, b) => (a + b)) + (line_gap * (text.length + 2));

    const sx = data.x - (maxW/2);
    const sy = data.y + data.size - line_gap;

    context.save();
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.shadowBlur = 8;
    context.shadowColor = "#000";
    context.beginPath();
    context.moveTo(sx + rect_rad, sy);
    context.arc(data.x, data.y, data.size + line_gap, startAngle, endAngle);
    context.lineTo(sx + maxW - rect_rad, sy);
    context.quadraticCurveTo(sx + maxW, sy, sx + maxW, sy + rect_rad);
    context.lineTo(sx + maxW, sy + allH - rect_rad);
    context.quadraticCurveTo(sx + maxW, sy + allH, sx + maxW - rect_rad, sy + allH);
    context.lineTo(sx + rect_rad, sy + allH);
    context.quadraticCurveTo(sx, sy + allH, sx, sy + allH - rect_rad);
    context.lineTo(sx, sy + rect_rad);
    context.quadraticCurveTo(sx, sy, sx + rect_rad, sy);
    context.closePath();
    context.fill();
    context.restore();

    text.forEach((t, idx) => {
        context.font = `${weight} ${size + (fontSizeRelative?.[idx] || 0)}px ${font}`;
        const tm = context.measureText(t);
        const text_height = tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent + (padding_y * 2);
        const text_width = tm.width + (padding_x * 2);

        context.fillStyle = txColor;
        context.fillText(
            t,
            data.x - (text_width / 2) + (padding_x),
            next_y_pos + tm.fontBoundingBoxAscent + (padding_y),
        );

        next_y_pos += text_height + line_gap;
    });
}

export function drawEdgeLabel(
    context: CanvasRenderingContext2D,
    edgeData: PartialButFor<EdgeDisplayData, "label" | "color" | "size">,
    sourceData: PartialButFor<NodeDisplayData, "x" | "y" | "size">,
    targetData: PartialButFor<NodeDisplayData, "x" | "y" | "size">,
    settings: Settings,
): void {
    const ratio = (Math.max(sourceData.size, targetData.size) / settings.labelRenderedSizeThreshold);
    const
        size = settings.edgeLabelSize * ratio,
        font = settings.edgeLabelFont,
        weight = settings.edgeLabelWeight,
        color = settings.edgeLabelColor.attribute
            ? edgeData[settings.edgeLabelColor.attribute] || settings.edgeLabelColor.color || "#000"
            : settings.edgeLabelColor.color;

    let label = edgeData.label;

    if (!label) return;

    context.fillStyle = color;
    context.font = `${weight} ${size}px ${font}`;

    // Computing positions without considering nodes sizes:
    const sSize = sourceData.size;
    const tSize = targetData.size;
    let sx = sourceData.x;
    let sy = sourceData.y;
    let tx = targetData.x;
    let ty = targetData.y;
    let cx = (sx + tx) / 2;
    let cy = (sy + ty) / 2;
    let dx = tx - sx;
    let dy = ty - sy;
    let d = Math.sqrt(dx * dx + dy * dy);

    if (d < sSize + tSize) return;

    // Adding nodes sizes:
    sx += (dx * sSize) / d;
    sy += (dy * sSize) / d;
    tx -= (dx * tSize) / d;
    ty -= (dy * tSize) / d;
    cx = (sx + tx) / 2;
    cy = (sy + ty) / 2;
    dx = tx - sx;
    dy = ty - sy;
    d = Math.sqrt(dx * dx + dy * dy);

    // Handling ellipsis
    let textLength = context.measureText(label).width;

    if (textLength > d) {
        const ellipsis = "…";
        label = label + ellipsis;
        textLength = context.measureText(label).width;

        while (textLength > d && label.length > 1) {
            label = label.slice(0, -2) + ellipsis;
            textLength = context.measureText(label).width;
        }

        if (label.length < 4) return;
    }

    let angle;
    if (dx > 0) {
        if (dy > 0) angle = Math.acos(dx / d);
        else angle = Math.asin(dy / d);
    } else {
        if (dy > 0) angle = Math.acos(dx / d) + Math.PI;
        else angle = Math.asin(dx / d) + Math.PI / 2;
    }

    context.save();
    context.translate(cx, cy);
    context.rotate(angle);

    context.fillText(label, -textLength / 2, edgeData.size / 2 + size);

    context.restore();
}