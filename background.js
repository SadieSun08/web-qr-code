// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 网页二维码插件已安装');
});

// 监听标签页更新事件，确保二维码能及时更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    console.log('[Background] 页面加载完成:', tab.url);
    
    // 检查并注入所需资源
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        return {
          hasQRCode: typeof window.QRCode !== 'undefined',
          hasContainer: !!document.querySelector('.webpage-qrcode-container'),
          hasModal: !!document.querySelector('.webpage-qrcode-modal')
        };
      }
    }).then(async (results) => {
      const status = results[0].result;
      console.log('[Background] 检查页面状态:', status);
      
      if (!status.hasQRCode || !status.hasContainer || !status.hasModal) {
        console.log('[Background] 需要注入资源');
        try {
          // 注入 CSS
          await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['content.css']
          });
          console.log('[Background] CSS 注入成功');
          
          // 注入 QRCode 库
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['qrcode.min.js']
          });
          console.log('[Background] QRCode 库注入成功');
          
          // 注入 content script
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          console.log('[Background] Content script 注入成功');
          
        } catch (error) {
          console.error('[Background] 资源注入失败:', error);
        }
      }
    }).catch(error => {
      console.error('[Background] 状态检查失败:', error);
    });
  }
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  console.log('[Background] 扩展图标被点击');
  
  try {
    // 检查当前标签页是否可以注入脚本
    if (!tab.url) {
      console.warn('[Background] 标签页 URL 无效');
      return;
    }
    
    if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
      console.log('[Background] 发送消息到页面:', tab.url);
      
      try {
        // 先尝试发送消息
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'toggleQRCode',
          url: tab.url,
          title: tab.title
        });
        console.log('[Background] 消息发送成功');
        
      } catch (error) {
        console.warn('[Background] 消息发送失败，尝试注入脚本:', error);
        
        try {
          // 注入 CSS
          await chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['content.css']
          });
          console.log('[Background] CSS 注入成功');
          
          // 注入 QRCode 库
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['qrcode.min.js']
          });
          console.log('[Background] QRCode 库注入成功');
          
          // 注入 content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          console.log('[Background] Content script 注入成功');
          
          // 重新发送消息
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'toggleQRCode',
            url: tab.url,
            title: tab.title
          });
          console.log('[Background] 重新发送消息成功');
          
        } catch (injectError) {
          console.error('[Background] 脚本注入失败:', injectError);
        }
      }
    } else {
      console.warn('[Background] 当前页面不支持显示二维码:', tab.url);
    }
  } catch (error) {
    console.error('[Background] 操作失败:', error);
  }
}); 