/*
    PioneBOT Join Image Creator
*/

import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "node:fs";

const templateList = fs.readdirSync("./assets/join").filter(file => file.endsWith(".png")).map(file => parseInt(file.split(".")[0]));

async function createJoinImage(userIcon: string, topText: string, bottomText: string, imageTemplate: number): Promise<Buffer> {
    const canvas = createCanvas(1024, 512);
    const ctx = canvas.getContext("2d");

    // テンプレート読み込み
    const image = await loadImage(`./assets/join/${imageTemplate}.png`);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // user iconを読み込み (円 224x224)
    // 左から80px、上から80pxの位置に描画
    const icon = await loadImage(userIcon);
    ctx.save();
    ctx.beginPath();
    ctx.arc(80 + 112, 80 + 112, 112, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(icon, 80, 80, 224, 224);
    ctx.restore();

    // フォント設定
    registerFont("./assets/fonts/Koruri-Extrabold.ttf", { family: "Koruri" });
    ctx.font = "64px Koruri";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";

    // ユーザーアイコンの隣にtopTextを描画(複数行対応)
    // アイコンの高さの中央、アイコンから64px右に描画
    ctx.textBaseline = "middle";
    const line = topText.split("\n").length;
    const topTextHeight = ctx.measureText(topText).actualBoundingBoxAscent + ctx.measureText(topText).actualBoundingBoxDescent;
    ctx.fillText(topText, 80 + 224 + 64, 80 + 112 - (line - 1) * (topTextHeight / line));

    // 下のメッセージを描画
    // したから64pxの位置に中央揃えで描画
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    ctx.fillText(bottomText, canvas.width / 2, canvas.height - 64);

    return canvas.toBuffer("image/png");
}

export { createJoinImage, templateList };