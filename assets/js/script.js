// تسجيل Service Worker بشكل محسن
if ('serviceWorker' in navigator) {
  // تأجيل تسجيل Service Worker حتى يكتمل تحميل الصفحة
  window.addEventListener('load', () => {
    // استخدام setTimeout لتأخير تسجيل Service Worker وعدم التنافس مع تحميل موارد الصفحة الرئيسية
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ تم تسجيل Service Worker بنجاح:', registration.scope);

          // تحديث تلقائي
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch((error) => {
          console.log('❌ فشل تسجيل Service Worker:', error);
        });

      // إعادة تحميل الصفحة بعد التحديث
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }, 2000); // تأخير 2 ثانية
  });
}

// تحسين التحميل الكسول للصور (Lazy Loading)
document.addEventListener('DOMContentLoaded', () => {
  // التحميل الكسول للصور باستخدام Intersection Observer
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          // استبدال مصدر الصورة عند ظهورها في الشاشة
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // دعم المتصفحات القديمة
    lazyImages.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  }
  
  // إضافة تأثيرات متحركة عند التمرير
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight * 0.8) {
        element.classList.add('animated');
      }
    });
  };
  
  // تحسين أداء التمرير باستخدام requestAnimationFrame
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    
    scrollTimeout = window.requestAnimationFrame(animateOnScroll);
  });
  
  // تحسين أداء النقر لزيادة الاستجابة
  document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('click', (e) => {
      // اختبار إذا كان الرابط يشير إلى قسم في نفس الصفحة
      if (element.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = element.getAttribute('href')?.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // التمرير السلس إلى القسم المستهدف
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
  
  // دعم الوصول عبر لوحة المفاتيح
  document.addEventListener('keydown', (e) => {
    // التنقل باستخدام Tab
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
});
