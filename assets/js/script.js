/**
 * مدير التطبيق الرئيسي
 * يحتوي على جميع المكونات المطلوبة للموقع
 */
const AppManager = {
  /**
   * تهيئة التطبيق
   */
  init: function() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initQuoteForm();
      this.initAnimations();
      this.initPWA();
    });
  },

  /**
   * تهيئة نظام الاقتباسات وإرسال البيانات
   */
  initQuoteForm: function() {
    const quoteModal = document.getElementById("quoteModal");
    if (!quoteModal) return;

    // تحديث قائمة المنتجات عند فتح النافذة المنبثقة
    quoteModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const productCard = button.closest(".card");
      let productTitle = "";

      if (productCard && productCard.querySelector(".card-title")) {
        productTitle = productCard.querySelector(".card-title").textContent;
      }

      // إنشاء قائمة المنتجات
      this.populateProductsList(productTitle);
    });

    // إضافة معالج حدث لزر الإرسال
    const quoteButton = document.querySelector(".modal-footer button.btn-info");
    if (quoteButton) {
      quoteButton.addEventListener("click", () => this.submitQuoteForm());
    }
  },

  /**
   * ملء قائمة المنتجات في نموذج الاقتباس
   * @param {string} selectedProduct - المنتج المحدد مسبقاً
   */
  populateProductsList: function(selectedProduct) {
    const selectElement = document.getElementById("productName");
    if (!selectElement) return;

    const allProducts = document.querySelectorAll(".card-title");
    selectElement.innerHTML = "";

    // إضافة خيار افتراضي
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- اختر المنتج --";
    selectElement.appendChild(defaultOption);

    // إضافة خيارات المنتجات
    allProducts.forEach(product => {
      if (product.textContent.trim() !== "") {
        const option = document.createElement("option");
        option.value = product.textContent;
        option.textContent = product.textContent;
        selectElement.appendChild(option);
      }
    });

    // تحديد المنتج المحدد مسبقاً إذا كان موجوداً
    if (selectedProduct) {
      for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === selectedProduct) {
          selectElement.selectedIndex = i;
          break;
        }
      }
    }
  },

  /**
   * إرسال نموذج الاقتباس
   */
  submitQuoteForm: function() {
    const form = document.getElementById("quoteForm");
    if (!form) return;

    // التحقق من صحة النموذج
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // جمع بيانات النموذج
    const data = {
      productName: document.getElementById("productName").value,
      quantity: document.getElementById("quantity").value,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      notes: document.getElementById("notes").value
    };

    // إرسال البيانات إلى Google Script
    this.sendDataToGoogleScript(data);
  },

  /**
   * إرسال البيانات إلى Google Script
   * @param {Object} data - البيانات المراد إرسالها
   */
  sendDataToGoogleScript: function(data) {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKdCIce5CpZLv2N5DUiyhrpE3X8EAVhcSzBakTuDOP5yC8lKTSSLuLI8RdGOYyP_H-/exec";
    
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data)
    })
    .then(response => {
      // يمكن إضافة معالجة للاستجابة هنا
      console.log("تم إرسال البيانات بنجاح");
      // يمكن إظهار رسالة نجاح للمستخدم
    })
    .catch(error => {
      console.error("حدث خطأ أثناء إرسال البيانات:", error);
      // يمكن إظهار رسالة خطأ للمستخدم
    });
  },

  /**
   * تهيئة التأثيرات والرسوم المتحركة
   */
  initAnimations: function() {
    this.initCounters();
    this.initCardAnimations();
  },

  /**
   * تهيئة عدادات الأرقام المتحركة
   */
  initCounters: function() {
    const counterElements = document.querySelectorAll(".counter");
    if (counterElements.length === 0) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.innerText);
          
          // بدء العد التصاعدي
          this.animateCounter(target, countTo);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(el => {
      observer.observe(el);
    });
  },

  /**
   * تحريك العداد
   * @param {HTMLElement} element - عنصر العداد
   * @param {number} finalValue - القيمة النهائية
   */
  animateCounter: function(element, finalValue) {
    let count = 0;
    const step = Math.ceil(finalValue / 20); // عدد الخطوات
    const duration = 50; // الوقت بين كل خطوة بالمللي ثانية

    const interval = setInterval(() => {
      count += step;
      
      if (count >= finalValue) {
        element.innerText = finalValue;
        clearInterval(interval);
      } else {
        element.innerText = count;
      }
    }, duration);
  },

  /**
   * تهيئة تأثيرات البطاقات
   */
  initCardAnimations: function() {
    const cards = document.querySelectorAll(".hover-effect");
    if (cards.length === 0) return;

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
      // تعيين الحالة الأولية للبطاقات
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s ease";
      cardObserver.observe(card);
    });
  },

  /**
   * تهيئة تطبيق الويب التقدمي (PWA)
   */
  initPWA: function() {
    // تسجيل Service Worker
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

    // إضافة مستمع لحدث تثبيت التطبيق
    window.addEventListener('beforeinstallprompt', (e) => {
      // احفظ الحدث حتى يمكن تشغيله لاحقاً
      window.deferredPrompt = e;
      
      // يمكنك هنا إضافة كود لإظهار زر التثبيت
      this.showInstallButton();
    });
  },

  /**
   * إظهار زر تثبيت التطبيق
   */
  showInstallButton: function() {
    const installButton = document.getElementById('install-button');
    if (!installButton) return;
    
    installButton.style.display = 'block';
    
    installButton.addEventListener('click', () => {
      if (!window.deferredPrompt) return;
      
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
};

// بدء تشغيل التطبيق
AppManager.init();
