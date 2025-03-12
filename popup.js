document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;
    const title = currentTab.title;
    const favicon = currentTab.favIconUrl || 'icons/icon48.png';

    // 设置网站信息
    document.getElementById('website-title').textContent = title;
    document.getElementById('website-url').textContent = url;
    document.getElementById('favicon').src = favicon;

    // 生成二维码
    const canvas = document.getElementById('qrcode');
    new QRCode(canvas, url);

    // 添加错误处理
    console.log('当前页面URL:', url);
    console.log('网站标题:', title);
    console.log('图标URL:', favicon);
  });
}); 