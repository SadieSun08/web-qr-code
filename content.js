// 在文件开头添加
console.log('[Content] 脚本开始加载');

let isInitialized = false;
let qrcodeContainer = null;
let qrcodeModal = null;

// 创建二维码容器
function createQRCodeContainer() {
  console.log('[Content] 创建二维码容器');
  const container = document.createElement('div');
  container.className = 'webpage-qrcode-container';
  container.style.display = 'none'; // 初始时隐藏
  
  const favicon = document.createElement('img');
  favicon.className = 'favicon';
  
  // 增加错误处理和多重后备方案获取favicon
  const getFaviconUrl = () => {
    try {
      // 尝试获取显式定义的favicon
      const iconLink = document.querySelector('link[rel="icon"]') || 
                      document.querySelector('link[rel="shortcut icon"]') ||
                      document.querySelector('link[rel*="icon"]');
      
      if (iconLink && iconLink.href) {
        console.log('[Content] 找到favicon:', iconLink.href);
        return Promise.resolve(iconLink.href);
      }
      
      // 尝试使用默认favicon路径
      const defaultFavicon = window.location.origin + '/favicon.ico';
      console.log('[Content] 使用默认favicon路径:', defaultFavicon);
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(defaultFavicon);
        img.onerror = () => {
          console.log('[Content] 默认favicon加载失败，使用扩展图标');
          resolve(chrome.runtime.getURL('icons/icon48.png'));
        };
        img.src = defaultFavicon;
      });
    } catch (error) {
      console.warn('[Content] 获取favicon时出错:', error);
      return Promise.resolve(chrome.runtime.getURL('icons/icon48.png'));
    }
  };

  getFaviconUrl().then(url => {
    console.log('[Content] 设置favicon URL:', url);
    favicon.src = url;
    favicon.onerror = () => {
      console.log('[Content] favicon加载失败，使用后备图标');
      favicon.src = chrome.runtime.getURL('icons/icon48.png');
    };
  });
  
  container.appendChild(favicon);
  return container;
}

// 创建二维码模态框
function createQRCodeModal() {
  console.log('[Content] 创建二维码模态框');
  const modal = document.createElement('div');
  modal.className = 'webpage-qrcode-modal';
  modal.style.display = 'none'; // 初始时隐藏
  
  const qrcodeDiv = document.createElement('div');
  qrcodeDiv.id = 'qrcode-container';
  
  const info = document.createElement('div');
  info.className = 'website-info';
  
  const title = document.createElement('div');
  title.className = 'website-title';
  title.textContent = document.title || window.location.hostname || '当前页面';
  
  info.appendChild(title);
  modal.appendChild(qrcodeDiv);
  modal.appendChild(info);
  
  return modal;
}

// 生成二维码
function generateQRCode(container, url) {
  console.log('[Content] 生成二维码:', url);
  // 清除已有的二维码
  container.innerHTML = '';
  
  try {
    if (typeof QRCode === 'undefined') {
      console.error('[Content] QRCode库未加载');
      container.innerHTML = '<div style="color: red;">QRCode库加载失败</div>';
      return;
    }
    
    new QRCode(container, {
      text: url,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    console.log('[Content] 二维码生成成功');
  } catch (error) {
    console.error('[Content] 生成二维码时出错:', error);
    container.innerHTML = '<div style="color: red;">二维码生成失败，请重试</div>';
  }
}

// 切换二维码显示状态
function toggleQRCode() {
  console.log('[Content] 切换二维码显示状态');
  if (!qrcodeContainer || !qrcodeModal) {
    console.warn('[Content] 容器未初始化');
    return;
  }
  
  const isVisible = qrcodeModal.style.display === 'block';
  if (!isVisible) {
    console.log('[Content] 显示二维码');
    qrcodeContainer.style.display = 'flex';
    qrcodeModal.style.display = 'block';
    setTimeout(() => {
      qrcodeModal.classList.add('show');
      const qrcodeDiv = document.getElementById('qrcode-container');
      if (qrcodeDiv) {
        generateQRCode(qrcodeDiv, window.location.href);
      } else {
        console.error('[Content] 找不到二维码容器元素');
      }
    }, 10);
  } else {
    console.log('[Content] 隐藏二维码');
    qrcodeModal.classList.remove('show');
    setTimeout(() => {
      qrcodeModal.style.display = 'none';
      qrcodeContainer.style.display = 'none';
    }, 300);
  }
}

// 初始化
function initialize() {
  console.log('[Content] 开始初始化');
  if (isInitialized) {
    console.log('[Content] 已经初始化过，跳过');
    return;
  }
  
  if (!document.body) {
    console.warn('[Content] body元素不存在，等待DOMContentLoaded事件');
    document.addEventListener('DOMContentLoaded', initialize);
    return;
  }

  isInitialized = true;

  // 创建并添加元素
  qrcodeContainer = createQRCodeContainer();
  qrcodeModal = createQRCodeModal();
  
  document.body.appendChild(qrcodeContainer);
  document.body.appendChild(qrcodeModal);

  console.log('[Content] 元素已添加到页面');

  // 点击图标显示/隐藏二维码
  qrcodeContainer.addEventListener('click', (e) => {
    console.log('[Content] 点击二维码图标');
    e.stopPropagation();
    toggleQRCode();
  });

  // 点击其他地方隐藏二维码
  document.addEventListener('click', (e) => {
    if (qrcodeModal.style.display === 'block' &&
        !qrcodeContainer.contains(e.target) && 
        !qrcodeModal.contains(e.target)) {
      console.log('[Content] 点击其他区域，隐藏二维码');
      toggleQRCode();
    }
  });

  // 监听 Escape 键关闭二维码
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && qrcodeModal.style.display === 'block') {
      console.log('[Content] 按下Escape键，关闭二维码');
      toggleQRCode();
    }
  });
  
  // 显示初始状态
  qrcodeContainer.style.display = 'flex';
  
  console.log('[Content] 初始化完成');
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content] 收到消息:', message);
  if (message.action === 'toggleQRCode') {
    if (!isInitialized) {
      console.log('[Content] 收到消息时未初始化，开始初始化');
      initialize();
    }
    toggleQRCode();
    sendResponse({ success: true });
  }
});

// 确保在页面完全加载后初始化
if (document.readyState === 'complete') {
  console.log('[Content] 页面已加载完成，直接初始化');
  initialize();
} else {
  console.log('[Content] 等待页面加载完成');
  window.addEventListener('load', () => {
    console.log('[Content] 页面加载完成，开始初始化');
    initialize();
  });
}

// 导出调试信息到全局作用域
window.__qrcodeDebug = {
  isInitialized,
  qrcodeContainer,
  qrcodeModal,
  initialize,
  toggleQRCode
}; 