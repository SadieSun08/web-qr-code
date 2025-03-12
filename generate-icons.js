const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 确保icons目录存在
if (!fs.existsSync('icons')) {
    fs.mkdirSync('icons');
}

// 定义需要生成的图标尺寸
const sizes = [16, 48, 128];

// 读取SVG文件
const svgBuffer = fs.readFileSync(path.join(__dirname, 'icons', 'icon.svg'));

// 为每个尺寸生成PNG
async function generateIcons() {
    try {
        for (const size of sizes) {
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(path.join(__dirname, 'icons', `icon${size}.png`));
            
            console.log(`✓ 成功生成 ${size}x${size} 图标`);
        }
        console.log('所有图标生成完成！');
    } catch (error) {
        console.error('生成图标时出错：', error);
    }
}

// 执行生成
generateIcons(); 