const fs = require('fs');
const path = require('path');
const { create } = require('xmlbuilder2');

const sitesDir = path.join(__dirname, 'sites');

// إنشاء الجذر للـ XML
const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('tv');

// دالة لتحليل JS واستخراج القنوات
function extractChannelsFromJS(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // نفترض أن الملف يحتوي على متغير JS باسم channels
    const regex = /const channels\s*=\s*([\s\S]*?);/m;
    const match = content.match(regex);
    if (!match) return [];
    let channels = [];
    try {
        channels = eval(match[1]); // تحويل النص إلى كائن JS
    } catch (e) {
        console.error('خطأ في تحليل JS:', filePath, e);
    }
    return channels;
}

// المرور على كل مجلد فرعي
fs.readdirSync(sitesDir).forEach(siteFolder => {
    const folderPath = path.join(sitesDir, siteFolder);
    if (fs.statSync(folderPath).isDirectory()) {
        const jsFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
        jsFiles.forEach(jsFile => {
            const jsPath = path.join(folderPath, jsFile);
            const channels = extractChannelsFromJS(jsPath);
            channels.forEach(ch => {
                const chEle = root.ele('channel', { id: ch.name });
                chEle.ele('display-name').txt(ch.name);
                chEle.ele('icon').txt(ch.icon || '');
                chEle.ele('url').txt(ch.url || '');
                // إضافة البرامج إذا موجودة
                if (ch.programs) {
                    ch.programs.forEach(p => {
                        root.ele('programme', {
                            start: p.start
