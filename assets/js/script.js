/**
 * المكونات الرئيسية للموقع - ملف JavaScript المدمج
 * =================================================
 * يحتوي هذا الملف على جميع الوظائف التفاعلية للموقع:
 * 1. إرسال بيانات النموذج إلى Google Script
 * 2. تأثيرات العداد والرسوم المتحركة للعناصر
 * 3. التعامل مع نافذة طلب الاقتباس المنبثقة
 * 4. دعم Progressive Web App (PWA) وتسجيل Service Worker
 * 5. تفعيل تلميحات Bootstrap
 * 6. وظيفة تبديل السمات (الثيم)
 */

// وحدة إرسال بيانات النموذج إلى Google Script
const QuoteFormHandler = {
  init: function() {
    const quoteButton = document.querySelector(".modal-footer button.btn-info");
    if (quoteButton) {
      quoteButton.addEventListener("click", this.handleSubmit.bind(this));
    }
  },
  
  // إظهار رسالة للمستخدم
  showMessage: function(message, isSuccess = true) {
    // التحقق من وجود عنصر للرسائل، أو إنشاء واحد إذا لم يكن موجودًا
    let messageElement = document.getElementById('form-message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'form-message';
      messageElement.className = 'alert mt-3';
      const modalBody = document.querySelector('.modal-body');
      modalBody.appendChild(messageElement);
    }
    
    // تعيين نوع الرسالة ومحتواها
    messageElement.className = isSuccess ? 'alert alert-success' : 'alert alert-danger';
    messageElement.textContent = message;
    
    // إخفاء الرسالة بعد فترة
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
    
    // إظهار الرسالة
    messageElement.style.display = 'block';
  },
  
  handleSubmit: function(event) {
    event.preventDefault(); // منع السلوك الافتراضي للنموذج
    
    const form = document.getElementById("quoteForm");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    // إظهار مؤشر التحميل
    const submitButton = document.querySelector(".modal-footer button.btn-info");
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> جاري الإرسال...';

    const data = {
      productName: document.getElementById("productName").value,
      quantity: document.getElementById("quantity").value,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      notes: document.getElementById("notes").value,
      timestamp: new Date().toISOString() // إضافة طابع زمني
    };

    // إرسال بيانات الاقتباس إلى Google Script
    fetch("https://script.google.com/macros/s/AKfycbzKdCIce5CpZLv2N5DUiyhrpE3X8EAVhcSzBakTuDOP5yC8lKTSSLuLI8RdGOYyP_H-/exec", {
      method: "POST",
      body: JSON.stringify(data),
      mode: 'no-cors' // مهم للتعامل مع CORS في Google Script
    })
    .then(response => {
      // استعادة حالة الزر
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      
      // بسبب استخدام mode: 'no-cors'، فإن response.ok سيكون دائمًا undefined
      // لذلك نفترض أن العملية ناجحة إذا لم يكن هناك خطأ
      this.showMessage("تم إرسال طلب الاقتباس بنجاح! سنتواصل معك قريبًا.", true);
      
      // إعادة تعيين النموذج
      form.reset();
      
      // إغلاق النافذة المنبثقة بعد مهلة قصيرة
      setTimeout(() => {
        const quoteModal = bootstrap.Modal.getInstance(document.getElementById('quoteModal'));
        if (quoteModal) {
          quoteModal.hide();
        }
      }, 3000);
    })
    .catch(error => {
      // استعادة حالة الزر
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      
      console.error("خطأ في الاتصال:", error);
      this.showMessage("حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.", false);
    });
  }
};

// وحدة تأثيرات العداد والرسوم المتحركة
const AnimationEffects = {
  init: function() {
    this.initCounters();
    this.initCardAnimations();
  },
  
  initCounters: function() {
    const counterElements = document.querySelectorAll(".counter");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.innerText);
          let count = 0;
          const interval = setInterval(() => {
            target.innerText = count;
            if (count >= countTo) {
              clearInterval(interval);
            }
            count = Math.ceil(count + countTo / 20);
          }, 50);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(el => {
      observer.observe(el);
    });
  },
  
  initCardAnimations: function() {
    const cards = document.querySelectorAll(".hover-effect");
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, index * 100);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s ease";
      cardObserver.observe(card);
    });
  }
};

// وحدة التعامل مع نافذة الاقتباس المنبثقة
const QuoteModal = {
  init: function() {
    const quoteModal = document.getElementById("quoteModal");
    if (quoteModal) {
      quoteModal.addEventListener("show.bs.modal", this.handleModalShow);
    }
  },
  
  handleModalShow: function(event) {
    const button = event.relatedTarget;
    const productCard = button.closest(".card");
    let productTitle = "";

    if (productCard && productCard.querySelector(".card-title")) {
      productTitle = productCard.querySelector(".card-title").textContent;
    }

    const selectElement = document.getElementById("productName");
    const allProducts = document.querySelectorAll(".card-title");
    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- اختر المنتج --";
    selectElement.appendChild(defaultOption);

    allProducts.forEach(product => {
      if (product.textContent.trim() !== "") {
        const option = document.createElement("option");
        option.value = product.textContent;
        option.textContent = product.textContent;
        selectElement.appendChild(option);
      }
    });

    if (productTitle) {
      for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === productTitle) {
          selectElement.selectedIndex = i;
          break;
        }
      }
    }
  }
};

// وحدة تهيئة Progressive Web App (PWA)
const PWASetup = {
  init: function() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
  },
  
  registerServiceWorker: function() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker تم تسجيله بنجاح:', registration.scope);
          })
          .catch(error => {
            console.log('فشل في تسجيل Service Worker:', error);
          });
      });
    }
  },
  
  setupInstallPrompt: function() {
    // متغير عام لتخزين حدث التثبيت
    window.deferredPrompt = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // منع ظهور مربع الحوار التلقائي
      e.preventDefault();
      
      // تخزين الحدث للاستخدام لاحقًا
      window.deferredPrompt = e;
      
      // يمكن هنا إضافة منطق لإظهار زر التثبيت المخصص
      this.showInstallButton();
    });
  },
  
  showInstallButton: function() {
    // البحث عن زر التثبيت إذا كان موجودًا في صفحتك
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', () => {
        // التأكد من أن الحدث موجود
        if (!window.deferredPrompt) {
          return;
        }
        
        // إظهار مربع حوار التثبيت
        window.deferredPrompt.prompt();
        
        // انتظار إجابة المستخدم
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('تم قبول تثبيت التطبيق');
          } else {
            console.log('تم رفض تثبيت التطبيق');
          }
          window.deferredPrompt = null;
        });
      });
    }
  }
};

// وحدة تفعيل تلميحات Bootstrap
const BootstrapComponents = {
  init: function() {
    this.initTooltips();
  },
  
  initTooltips: function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bss-tooltip]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
};

// وحدة تبديل السمات (الثيم)
const ThemeSwitcher = {
  init: function() {
    this.themeKey = 'site-theme';
    this.defaultTheme = 'light';
    this.setupThemeToggle();
    this.applyTheme();
  },
  
  setupThemeToggle: function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  },
  
  getCurrentTheme: function() {
    return localStorage.getItem(this.themeKey) || this.defaultTheme;
  },
  
  setTheme: function(themeName) {
    localStorage.setItem(this.themeKey, themeName);
    this.applyTheme();
  },
  
  toggleTheme: function() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  },
  
  applyTheme: function() {
    const currentTheme = this.getCurrentTheme();
    document.documentElement.setAttribute('data-bs-theme', currentTheme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${currentTheme}`);
    
    // تحديث أيقونة زر التبديل إذا وجدت
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
      if (currentTheme === 'dark') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        // أو يمكن استخدام الأسلوب التالي إذا كان لديك أيقونات مختلفة
        // themeIcon.classList.remove('fa-moon');
        // themeIcon.classList.add('fa-sun');
      } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        // themeIcon.classList.remove('fa-sun');
        // themeIcon.classList.add('fa-moon');
      }
    }
  }
};

// دالة التهيئة الرئيسية - يتم استدعاؤها عند تحميل المستند
function initializeApp() {
  // تهيئة جميع وحدات التطبيق
  QuoteFormHandler.init();
  AnimationEffects.init();
  QuoteModal.init();
  PWASetup.init();
  BootstrapComponents.init();
  ThemeSwitcher.init();
  
  console.log('تم تهيئة جميع وحدات التطبيق بنجاح');
}

// التأكد من تحميل المستند قبل تنفيذ الكود
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
