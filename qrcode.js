class QRCode {
  constructor(canvas, text, width = 180, height = 180) {
    this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.text = text;
    this.ctx = this.canvas.getContext('2d');
    this.size = width;
    this.generate();
  }

  generate() {
    // 清空画布
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.size, this.size);

    // 计算二维码数据
    const qr = this.generateQRData(this.text);
    const cellSize = this.size / qr.length;

    // 绘制二维码
    for (let row = 0; row < qr.length; row++) {
      for (let col = 0; col < qr[row].length; col++) {
        if (qr[row][col]) {
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(
            col * cellSize,
            row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }

  generateQRData(text) {
    // 简单的二维码数据生成算法
    const size = 21; // 21x21的二维码
    const data = Array(size).fill().map(() => Array(size).fill(0));

    // 添加定位图案
    this.addPositionPattern(data, 0, 0);
    this.addPositionPattern(data, size - 7, 0);
    this.addPositionPattern(data, 0, size - 7);

    // 添加对齐图案
    this.addAlignmentPattern(data, 18, 18);
    this.addAlignmentPattern(data, 18, 4);
    this.addAlignmentPattern(data, 4, 18);

    // 添加数据
    const textData = this.textToBinary(text);
    let dataIndex = 0;
    
    // 从右下角开始填充数据
    for (let i = size - 1; i >= 0; i -= 2) {
      if (i === 6) i--; // 跳过垂直时序图案
      
      for (let j = size - 1; j >= 0; j--) {
        if (dataIndex < textData.length) {
          if (data[i][j] === 0) {
            data[i][j] = parseInt(textData[dataIndex]);
            dataIndex++;
          }
        }
      }
    }

    return data;
  }

  addPositionPattern(data, row, col) {
    // 绘制定位图案
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || 
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          data[row + i][col + j] = 1;
        }
      }
    }
  }

  addAlignmentPattern(data, row, col) {
    // 绘制对齐图案
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4 || j === 0 || j === 4 || 
            (i === 2 && j === 2)) {
          data[row + i][col + j] = 1;
        }
      }
    }
  }

  textToBinary(text) {
    // 将文本转换为二进制
    let binary = '';
    for (let i = 0; i < text.length; i++) {
      binary += text.charCodeAt(i).toString(2).padStart(8, '0');
    }
    return binary;
  }
} 