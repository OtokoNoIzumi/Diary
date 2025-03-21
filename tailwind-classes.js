/**
 * Tailwind类简化映射
 *
 * 这个文件定义了常用Tailwind类组合的简化映射，目的是:
 * 1. 减少HTML文件中的重复代码
 * 2. 提高可读性和可维护性
 * 3. 减少LLM上下文窗口大小
 */

// 定义类名映射
const twClasses = {
  // 文本相关
  'text': 'text-xl md:text-2xl opacity-90 mb-8 animate-slide-up',

  // 容器相关
  'about-flex-container-2': 'flex items-center justify-between',
  'about-flex-container-3': 'flex items-center space-x-3 mt-4',
  'about-flex-container-4': 'flex flex-col md:flex-row gap-6',
  'container': 'theme-card overflow-hidden',
  'container-4': 'container mx-auto px-4 relative z-10',
  'container-bg': 'absolute inset-0 bg-cover bg-center opacity-20',
  'flex-container': 'flex items-center mb-4',
  'flex-container-2': 'flex flex-col md:flex-row justify-between items-center',
  'flex-container-3': 'flex justify-center space-x-4 animate-slide-up',
  'flex-container-4': 'container mx-auto px-4 py-3 flex flex-col space-y-3',
  'flex-container-5': 'container mx-auto px-4 py-3 flex justify-between items-center',
  'flex-container-6': 'flex items-center mb-8 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap',
  'gallery-container-2': 'theme-img-container aspect-square',
  'gallery-container-3': 'img-container aspect-[4/3]',
  'gallery-container-4': 'absolute -top-6 -left-2 transform -rotate-12 z-10',
  'gallery-flex-container': 'flex items-center justify-between mb-3',
  'gallery-flex-container-1': 'flex flex-wrap justify-center gap-2 md:gap-3',
  'gallery-flex-container-2': 'flex items-center mb-6 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap',

  // 其他组件
  'about': 'fas fa-heart mr-1',
  'about-1': 'fas fa-users mr-1',
  'about-grid': 'grid grid-cols-1 md:grid-cols-2 gap-8',
  'about-heading': 'theme-section-title text-3xl font-bold',
  'about-image': 'w-full h-full object-cover',
  'about-image-1': 'h-10 w-10 rounded-full object-cover mr-3',
  'gallery': 'fas fa-expand-alt',
  'gallery-grid': 'grid grid-cols-2 md:grid-cols-3 gap-4',
  'grid': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  'heading': 'text-4xl md:text-5xl font-bold mb-4 animate-fade-in',
  'image': 'w-full h-24 object-cover',
  'image-1': 'max-w-full max-h-[90vh] object-contain',
  'label': 'theme-badge mr-2 whitespace-nowrap',
  'ui-component': 'mb-16 animate-on-scroll',
  'ui-component-1': 'fas fa-umbrella mr-1',
  'ui-component-2': 'fas fa-glass-cheers mr-1',
  'ui-component-3': 'fas fa-quote-right text-sm align-super ml-2 opacity-70',
  'ui-component-4': 'fas fa-quote-left text-sm align-super mr-2 opacity-70',
  'ui-component-5': 'relative theme-banner py-16 md:py-24',

};

// 定义参数化模板
const twTemplates = {
  't-about-container-themed': 'bg-{color-1}-50 dark:bg-{color-2}-700/50 rounded-lg p-4 my-4 border-l-4 border-{color-3}-500',
  't-about-flex-container': 'flex-shrink-0 h-10 w-10 theme-avatar bg-{color-1}-100 dark:bg-{color-2}-900 mr-4',
  't-about-heading': 'text-xl font-bold text-{color-1}-800 dark:text-{color-2} mb-4 flex items-center',
  't-about-heading-1': 'text-xl font-bold text-{color-1}-800 dark:text-{color-2} mb-4',
  't-about-heading-2': 'text-sm font-medium text-{color-1}-800 dark:text-{color-2}',
  't-about-heading-3': 'text-lg font-medium text-{color-1}-800 dark:text-{color-2}',
  't-about-label': 'ml-3 text-sm font-normal text-{color-1}-500 bg-{color-2}-50 dark:bg-{color-3}-900/30 px-2 py-1 rounded-full',
  't-about-label-1': 'bg-gradient-to-r from-{color-1}-400 to-{color-2}-600 text-{color-3} px-3 py-1 rounded-full text-sm mr-3',
  't-about-text-themed': 'text-xs text-{color-1}-500 dark:text-{color-2}-400',
  't-about-text-themed-1': 'text-{color-1}-700 dark:text-{color-2}-300 mb-4',
  't-about-text-themed-2': 'text-{color-1}-600 dark:text-{color-2}-400',
  't-btn': 'hidden md:block text-sm font-medium text-{color-1}-700 hover:text-{color-2}-500 dark:text-{color-3}-300 dark:hover:text-{color-4}-400 transition-colors',
  't-btn-1': 'text-sm font-medium text-{color-1}-700 hover:text-{color-2}-500 dark:text-{color-3}-300 dark:hover:text-{color-4}-400 transition-colors',
  't-btn-2': 'text-{color-1}-600 hover:text-{color-2}-500 dark:text-{color-3}-400 dark:hover:text-{color-4}-400 transition-colors',
  't-btn-3': 'p-2 rounded-lg text-{color-1}-500 hover:text-{color-2}-900 dark:text-{color-3}-400 dark:hover:text-{color-4} theme-btn',
  't-btn-4': 'absolute right-4 text-{color-1} hover:text-{color-2}-300 text-2xl opacity-70 hover:opacity-100 theme-btn',
  't-btn-5': 'absolute left-4 text-{color-1} hover:text-{color-2}-300 text-2xl opacity-70 hover:opacity-100 theme-btn',
  't-btn-6': 'absolute top-4 right-4 text-{color-1} hover:text-{color-2}-300 text-2xl theme-btn',
  't-container-avatar': 'h-10 w-10 theme-avatar bg-{color-1}-100 dark:bg-{color-2}-900 mr-3',
  't-container-themed': 'md:hidden hidden bg-{color-1} dark:bg-{color-2}-900 theme-border-b animate-fade-in',
  't-container-themed-1': 'pl-4 border-l-2 border-{color-1}-200 dark:border-{color-2}-700 my-3',
  't-flex-container': 'h-10 w-10 rounded-full bg-{color-1}-100 dark:bg-{color-2}-900 flex items-center justify-center mr-3',
  't-gallery-btn': 'absolute top-3 right-3 bg-{color-1}/20 backdrop-blur-sm p-2 rounded-full text-{color-2} hover:bg-{color-3}/40 transition-colors lightbox-trigger theme-btn',
  't-gallery-btn-1': 'absolute top-3 right-3 bg-{color-1}/20 backdrop-blur-sm p-2 rounded-full text-{color-2} hover:bg-{color-3}/40 transition-colors lightbox-trigger',
  't-gallery-container': 'text-3xl font-bold text-{color-1}-500',
  't-gallery-container-bg': 'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-{color-1}/70 via-{color-2}/30 to-transparent',
  't-gallery-container-rounded': 'absolute top-3 left-3 bg-{color-1}-500 text-{color-2} text-xs px-2 py-1 rounded-full',
  't-gallery-container-shadow': 'bg-{color-1}-500 text-{color-2} text-sm px-3 py-1 rounded-lg shadow-lg',
  't-gallery-container-themed': 'card bg-{color-1} dark:bg-{color-2}-800 rounded-xl shadow-md overflow-hidden',
  't-gallery-container-themed-1': 'text-2xl text-{color-1}-300 dark:text-{color-2}-600',
  't-gallery-container-themed-2': 'text-sm text-{color-1}-600 dark:text-{color-2}-400',
  't-gallery-flex-container': 'h-6 w-6 rounded-full bg-{color-1}-100 dark:bg-{color-2}-900 flex items-center justify-center border-2 border-{color-3} dark:border-{color-4}-800',
  't-gallery-flex-container-1': 'h-14 w-14 rounded-full bg-{color-1}-100 dark:bg-{color-2}-900 flex items-center justify-center mx-auto mb-1',
  't-gallery-heading': 'text-lg font-medium text-{color-1}-800 dark:text-{color-2} mb-4',
  't-gallery-heading-1': 'text-xl font-bold text-{color-1}-800 dark:text-{color-2}',
  't-gallery-label': 'font-medium text-{color-1}-700 dark:text-{color-2}-200',
  't-gallery-label-1': 'text-{color-1}-500 text-xs font-bold',
  't-gallery-text': 'text-{color-1} text-sm font-medium',
  't-gallery-text-themed': 'text-xs text-{color-1}-600 dark:text-{color-2}-400',
  't-heading': 'text-xl font-bold text-{color-1}-800 dark:text-{color-2} flex items-center',
  't-heading-1': 'text-{color-1} font-bold',
  't-label': 'inline-flex items-center px-3 py-1 rounded-full bg-{color-1}/20 text-sm',
  't-label-1': 'text-{color-1}-500 dark:text-{color-2}-400 text-sm flex items-center',
  't-label-2': 'text-{color-1}-500 font-bold',
  't-text-themed': 'text-{color-1}-600 dark:text-{color-2}-400 italic text-sm mt-2',
  't-text-themed-1': 'text-{color-1}-600 dark:text-{color-2}-400 italic text-sm',
  't-text-themed-2': 'text-{color-1}-700 dark:text-{color-2}-300 font-bold',
  't-text-themed-3': 'text-{color-1}-700 dark:text-{color-2}-300',
  't-themed': 'ml-2 text-xs p-1 rounded bg-{color-1} dark:bg-{color-2}-700 text-{color-3}-700 dark:text-{color-4}-200 border border-{color-5}-300 dark:border-{color-6}-600 theme-btn',
  't-themed-1': 'bg-gradient-to-br from-{color-1}-50 to-{color-2} dark:from-{color-3}-900 dark:to-{color-4}-800 min-h-screen transition-colors duration-300',
  't-themed-2': 'sticky top-0 z-50 bg-{color-1}/80 dark:bg-{color-2}-900/80 backdrop-blur-md shadow-sm theme-border-b',
  't-ui-component': 'fas fa-fist-raised text-{color-1}-500 mx-1',
  't-ui-component-1': 'fas fa-thumbs-up text-{color-1}-500 mx-1',
  't-ui-component-2': 'fas fa-umbrella text-{color-1}-500 mx-1',
  't-ui-component-3': 'fas fa-gift text-{color-1}-500 mx-1',
  't-ui-component-4': 'fas fa-heart text-{color-1}-500 mx-1',
};

// 页面加载时应用类名
document.addEventListener('DOMContentLoaded', function() {
  console.log('正在应用Tailwind类映射...');

  // 应用普通类映射
  const elements = document.querySelectorAll('[data-tw]');
  elements.forEach(el => {
    const classNames = el.getAttribute('data-tw').split(' ');
    classNames.forEach(name => {
      if (twClasses[name]) {
        twClasses[name].split(' ').forEach(cls => {
          el.classList.add(cls);
        });
      }
    });
  });

  // 应用参数化模板
  const paramElements = document.querySelectorAll('[data-tw-param]');
  paramElements.forEach(el => {
    const paramData = el.getAttribute('data-tw-param').split(':');
    if (paramData.length >= 2) {
      const templateName = paramData[0];
      const params = paramData[1].split(',');

      // 检查是否有匹配的模板
      if (twTemplates[templateName]) {
        let classString = twTemplates[templateName];

        // 替换颜色参数
        for (let i = 1; i <= 5; i++) {
          const pattern = new RegExp(`{color-${i}}`, 'g');
          if (params[i-1]) {
            classString = classString.replace(pattern, params[i-1]);
          }
        }

        // 添加处理后的类
        classString.split(' ').forEach(cls => {
          el.classList.add(cls);
        });
      }
    }
  });

  console.log('Tailwind类映射应用完成!');
});
