(() => {
  const loader = document.getElementById("pageLoader");
  if (!loader) {
    return;
  }

  const minDurationMs = 1500;
  const startedAt = performance.now();
  let isWindowLoaded = document.readyState === "complete";

  const hideLoader = () => {
    if (!isWindowLoaded) {
      return;
    }

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, minDurationMs - elapsed);

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      loader.addEventListener(
        "transitionend",
        () => {
          loader.remove();
        },
        { once: true }
      );
    }, remaining);
  };

  if (!isWindowLoaded) {
    window.addEventListener(
      "load",
      () => {
        isWindowLoaded = true;
        hideLoader();
      },
      { once: true }
    );
  } else {
    hideLoader();
  }
})();

(() => {
  const panel = document.querySelector(".main-glass-panel");
  const tabs = document.querySelectorAll(".panel-tab");
  const views = document.querySelectorAll(".panel-view");
  if (!panel || !tabs.length || !views.length) {
    return;
  }

  const panelClasses = ["is-stars", "is-premium", "is-ton"];

  const activatePanel = (name) => {
    panel.classList.remove(...panelClasses);
    panel.classList.add(`is-${name}`);

    tabs.forEach((tab) => {
      const isActive = tab.dataset.panel === name;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    views.forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === name);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activatePanel(tab.dataset.panel);
    });
  });
})();

(() => {
  const grids = document.querySelectorAll(".offer-grid");
  if (!grids.length) {
    return;
  }

  grids.forEach((grid) => {
    const cards = Array.from(grid.querySelectorAll(".offer-card"));
    const panelView = grid.closest(".panel-view");
    const quantityInput = panelView?.querySelector('.form-input[type="number"]');
    const priceUsdNode = panelView?.querySelector("[data-price-usd]");
    const priceRubNode = panelView?.querySelector("[data-price-rub]");

    const getCardAmount = (card) =>
      card.querySelector(".offer-card-amount")?.textContent?.trim() || "";

    const getCardPrice = (card) => {
      const rawPrice = card?.querySelector(".offer-card-price")?.textContent?.trim() || "";
      const [usdPart = "", rubPart = ""] = rawPrice.split("/");
      return {
        usd: usdPart.trim(),
        rub: rubPart.trim(),
      };
    };

    const syncPriceRow = (card) => {
      if (!priceUsdNode || !priceRubNode) {
        return;
      }

      const sourceCard = card || cards[0] || null;
      if (!sourceCard) {
        priceUsdNode.textContent = "—";
        priceRubNode.textContent = "—";
        return;
      }

      const { usd, rub } = getCardPrice(sourceCard);
      priceUsdNode.textContent = usd || "—";
      priceRubNode.textContent = rub || "—";
    };

    const setActiveCard = (activeCard) => {
      cards.forEach((item) => item.classList.remove("is-active"));
      if (activeCard) {
        activeCard.classList.add("is-active");
      }
    };

    const findCardByAmount = (value) => {
      const normalized = String(value).trim();
      if (!normalized) {
        return null;
      }

      return (
        cards.find((card) => getCardAmount(card) === normalized) || null
      );
    };

    const syncInputWithActiveCard = () => {
      const activeCard = cards.find((item) => item.classList.contains("is-active"));
      syncPriceRow(activeCard);

      if (!quantityInput) {
        return;
      }

      const nextValue = activeCard ? getCardAmount(activeCard) : "";
      if (quantityInput.value !== nextValue) {
        quantityInput.value = nextValue;
      }
    };

    const initialActiveCard = grid.querySelector(".offer-card.is-active");
    if (initialActiveCard) {
      setActiveCard(initialActiveCard);
    }
    syncInputWithActiveCard();

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const shouldDeactivate = card.classList.contains("is-active");
        setActiveCard(shouldDeactivate ? null : card);
        syncInputWithActiveCard();
      });
    });

    if (quantityInput) {
      quantityInput.addEventListener("input", () => {
        const matchedCard = findCardByAmount(quantityInput.value);
        setActiveCard(matchedCard);
        syncPriceRow(matchedCard);
      });
    }
  });
})();

(() => {
  const usernameInputs = document.querySelectorAll(".form-input--telegram");
  if (!usernameInputs.length) {
    return;
  }

  const sanitizeTelegramUsername = (rawValue) => {
    const cleaned = rawValue.replace(/[^@A-Za-z0-9_]/g, "");
    const usernamePart = cleaned.replace(/@/g, "").slice(0, 32);

    if (!cleaned) {
      return "";
    }

    return `@${usernamePart}`;
  };

  usernameInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const sanitizedValue = sanitizeTelegramUsername(input.value);
      if (input.value !== sanitizedValue) {
        input.value = sanitizedValue;
      }
    });
  });
})();

(() => {
  const dismissKeyboardIfNeeded = (event) => {
    const activeElement = document.activeElement;
    if (!activeElement) {
      return;
    }

    const isTextInput =
      activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
    if (!isTextInput) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest(".form-input-wrap")) {
      return;
    }

    activeElement.blur();
  };

  document.addEventListener("pointerdown", dismissKeyboardIfNeeded);
  document.addEventListener("touchstart", dismissKeyboardIfNeeded, { passive: true });
})();

(() => {
  const avatarToggle = document.getElementById("userAvatarToggle");
  const quickMenu = document.getElementById("headerQuickMenu");
  if (!avatarToggle || !quickMenu) {
    return;
  }

  avatarToggle.addEventListener("click", (event) => {
    event.preventDefault();
  });

  avatarToggle.setAttribute("aria-expanded", "false");
  avatarToggle.setAttribute("aria-disabled", "true");
  quickMenu.classList.add("is-open");
  quickMenu.setAttribute("aria-hidden", "false");
})();

(() => {
  const telegramBotButton = document.getElementById("telegramBotButton");
  if (!telegramBotButton) {
    return;
  }

  const telegramBotUrl = "https://t.me/starslixbot";

  telegramBotButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(telegramBotUrl);
      return;
    }

    window.open(telegramBotUrl, "_blank", "noopener,noreferrer");
  });
})();

(() => {
  const languageToggleButton = document.getElementById("languageToggleButton");
  const languageDropdown = document.getElementById("languageDropdown");
  const languageSwitch = document.getElementById("headerLanguageSwitch");
  const languageOptions = Array.from(document.querySelectorAll(".header-language-option"));
  if (!languageToggleButton || !languageDropdown || !languageSwitch || !languageOptions.length) {
    return;
  }

  const translations = {
    ru: {
      loaderAria: "Загрузка",
      profileButtonAria: "Открыть меню профиля",
      telegramButton: "Telegram-бот",
      languageButton: "Смена языка",
      languageShort: "RU",
      languageOptionRu: "Русский",
      languageOptionEn: "Английский",
      heroMobileLine1: "Получите",
      heroMobileLine2Prefix: "свои ",
      heroStars: "звёзды",
      heroMobileLine3: "здесь!",
      heroWideLine1: "Получите свои",
      heroWideLine2Suffix: "здесь!",
      heroSubtitleLine1: "Покупайте звёзды быстро и анонимно.",
      heroSubtitleLine2: "Никаких KYC верификации и риска возврата.",
      mainPanelAria: "Основной блок контента",
      panelTabsAria: "Разделы",
      panelTabStarsAria: "Звёзды",
      panelTabPremiumAria: "Премиум",
      starsGridAria: "Пакеты звёзд",
      premiumGridAria: "Пакеты премиума",
      cardStars100Aria: "Пакет звёзд 100",
      cardStars500Aria: "Пакет звёзд 500",
      cardStars1000Aria: "Пакет звёзд 1000",
      cardPremium100Aria: "Пакет премиума 3 месяца",
      cardPremium500Aria: "Пакет премиума 6 месяцев",
      cardPremium1000Aria: "Пакет премиума 12 месяцев",
      premiumDuration3: "3 мес.",
      premiumDuration6: "6 мес.",
      premiumDuration12: "12 мес.",
      badgeValue: "Выгодно",
      badgePopular: "Популярно",
      usernameFloatingLabel: "Введите Telegram @username",
      amountFloatingLabel: "Введите количество (50 - 10000)",
      paymentMethodLabel: "Метод оплаты",
      paymentMethodText: "СПБ #1 (PALLY)",
      orderButton: "Оформить заказ",
      orderNote:
        "Приобретая Telegram Stars или Telegram Premium, вы подтверждаете свое согласие с нашими Условиями и подтверждаете, что не являетесь резидентом США.",
    },
    en: {
      loaderAria: "Loading",
      profileButtonAria: "Open profile menu",
      telegramButton: "Telegram bot",
      languageButton: "Switch language",
      languageShort: "EN",
      languageOptionRu: "Russian",
      languageOptionEn: "English",
      heroMobileLine1: "Get",
      heroMobileLine2Prefix: "your ",
      heroStars: "stars",
      heroMobileLine3: "here!",
      heroWideLine1: "Get your",
      heroWideLine2Suffix: "here!",
      heroSubtitleLine1: "Buy stars quickly and anonymously.",
      heroSubtitleLine2: "No KYC verification and no chargeback risk.",
      mainPanelAria: "Main content section",
      panelTabsAria: "Sections",
      panelTabStarsAria: "Stars",
      panelTabPremiumAria: "Premium",
      starsGridAria: "Star packages",
      premiumGridAria: "Premium packages",
      cardStars100Aria: "100 stars package",
      cardStars500Aria: "500 stars package",
      cardStars1000Aria: "1000 stars package",
      cardPremium100Aria: "Premium package 3 months",
      cardPremium500Aria: "Premium package 6 months",
      cardPremium1000Aria: "Premium package 12 months",
      premiumDuration3: "3 mo.",
      premiumDuration6: "6 mo.",
      premiumDuration12: "12 mo.",
      badgeValue: "Best value",
      badgePopular: "Popular",
      usernameFloatingLabel: "Enter Telegram @username",
      amountFloatingLabel: "Enter amount (50 - 10000)",
      paymentMethodLabel: "Payment method",
      paymentMethodText: "SBP #1 (PALLY)",
      orderButton: "Place order",
      orderNote:
        "By purchasing Telegram Stars or Telegram Premium, you confirm your agreement with our Terms and confirm that you are not a resident of the USA.",
    },
  };

  const storageKey = "starslix_lang";

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  };

  const setAttr = (selector, attr, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute(attr, value);
    }
  };

  const setHeroSecondLines = (dict) => {
    const mobileLine2 = document.querySelector(
      ".hero-title-layout-mobile .hero-title-line:nth-child(2)"
    );
    if (mobileLine2) {
      mobileLine2.innerHTML = `${dict.heroMobileLine2Prefix}<span class="hero-title-accent">${dict.heroStars}</span>`;
    }

    const wideLine2 = document.querySelector(
      ".hero-title-layout-wide .hero-title-line:nth-child(2)"
    );
    if (wideLine2) {
      wideLine2.innerHTML = `<span class="hero-title-accent">${dict.heroStars}</span> ${dict.heroWideLine2Suffix}`;
    }
  };

  const applyLanguage = (lang) => {
    const dict = translations[lang] || translations.ru;

    document.documentElement.lang = lang;
    setAttr("#pageLoader", "aria-label", dict.loaderAria);
    setAttr("#userAvatarToggle", "aria-label", dict.profileButtonAria);

    setText("#telegramBotButton", dict.telegramButton);
    setAttr("#languageToggleButton", "aria-label", dict.languageButton);
    setText("#languageToggleValue", dict.languageShort);
    setText("#languageOptionRu", dict.languageOptionRu);
    setText("#languageOptionEn", dict.languageOptionEn);

    languageOptions.forEach((option) => {
      option.classList.toggle("is-active", option.dataset.lang === lang);
    });

    setText(".hero-title-layout-mobile .hero-title-line:nth-child(1)", dict.heroMobileLine1);
    setHeroSecondLines(dict);
    setText(".hero-title-layout-mobile .hero-title-line:nth-child(3)", dict.heroMobileLine3);
    setText(".hero-title-layout-wide .hero-title-line:nth-child(1)", dict.heroWideLine1);

    setText(".hero-subtitle-line:nth-child(1)", dict.heroSubtitleLine1);
    setText(".hero-subtitle-line:nth-child(2)", dict.heroSubtitleLine2);

    setAttr(".main-glass-panel", "aria-label", dict.mainPanelAria);
    setAttr(".panel-tabs", "aria-label", dict.panelTabsAria);
    setAttr('.panel-tab[data-panel="stars"]', "aria-label", dict.panelTabStarsAria);
    setAttr('.panel-tab[data-panel="premium"]', "aria-label", dict.panelTabPremiumAria);

    setAttr(".offer-grid-stars", "aria-label", dict.starsGridAria);
    setAttr(".offer-grid-premium", "aria-label", dict.premiumGridAria);
    setAttr(".offer-grid-stars .offer-card:nth-child(1)", "aria-label", dict.cardStars100Aria);
    setAttr(".offer-grid-stars .offer-card:nth-child(2)", "aria-label", dict.cardStars500Aria);
    setAttr(".offer-grid-stars .offer-card:nth-child(3)", "aria-label", dict.cardStars1000Aria);
    setAttr(".offer-grid-premium .offer-card:nth-child(1)", "aria-label", dict.cardPremium100Aria);
    setAttr(".offer-grid-premium .offer-card:nth-child(2)", "aria-label", dict.cardPremium500Aria);
    setAttr(".offer-grid-premium .offer-card:nth-child(3)", "aria-label", dict.cardPremium1000Aria);
    setText(".offer-grid-premium .offer-card:nth-child(1) .offer-card-amount", dict.premiumDuration3);
    setText(".offer-grid-premium .offer-card:nth-child(2) .offer-card-amount", dict.premiumDuration6);
    setText(".offer-grid-premium .offer-card:nth-child(3) .offer-card-amount", dict.premiumDuration12);

    document.querySelectorAll(".offer-card--value .offer-card-badge").forEach((badge) => {
      badge.textContent = dict.badgeValue;
    });
    document.querySelectorAll(".offer-card--popular .offer-card-badge").forEach((badge) => {
      badge.textContent = dict.badgePopular;
    });

    setText(
      ".form-stack--stars .form-field:nth-child(1) .form-floating-label",
      dict.usernameFloatingLabel
    );
    setText(
      ".form-stack--stars .form-field:nth-child(2) .form-floating-label",
      dict.amountFloatingLabel
    );
    setText(
      ".form-stack--stars .form-field:nth-child(3) .form-field-label",
      dict.paymentMethodLabel
    );
    setText(
      ".form-stack--premium .form-field:nth-child(1) .form-floating-label",
      dict.usernameFloatingLabel
    );
    setText(
      ".form-stack--premium .form-field:nth-child(2) .form-field-label",
      dict.paymentMethodLabel
    );

    document.querySelectorAll(".form-static-text").forEach((node) => {
      node.textContent = dict.paymentMethodText;
    });
    document.querySelectorAll(".order-submit-button").forEach((node) => {
      node.textContent = dict.orderButton;
    });
    document.querySelectorAll(".order-note").forEach((node) => {
      node.textContent = dict.orderNote;
    });
  };

  const getSavedLanguage = () => {
    try {
      const savedLanguage = window.localStorage.getItem(storageKey);
      return savedLanguage === "en" || savedLanguage === "ru" ? savedLanguage : null;
    } catch {
      return null;
    }
  };

  const saveLanguage = (lang) => {
    try {
      window.localStorage.setItem(storageKey, lang);
    } catch {
      // ignore write errors
    }
  };

  let currentLanguage = getSavedLanguage() || "ru";
  applyLanguage(currentLanguage);

  let isDropdownOpen = false;

  const setDropdownState = (open) => {
    isDropdownOpen = open;
    languageDropdown.classList.toggle("is-open", open);
    languageDropdown.setAttribute("aria-hidden", open ? "false" : "true");
    languageToggleButton.setAttribute("aria-expanded", open ? "true" : "false");
  };

  languageToggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setDropdownState(!isDropdownOpen);
  });

  languageOptions.forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      const nextLanguage = option.dataset.lang;
      if (nextLanguage !== "ru" && nextLanguage !== "en") {
        return;
      }

      currentLanguage = nextLanguage;
      applyLanguage(currentLanguage);
      saveLanguage(currentLanguage);
      setDropdownState(false);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!isDropdownOpen) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("#headerLanguageSwitch")) {
      return;
    }

    setDropdownState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isDropdownOpen) {
      setDropdownState(false);
    }
  });
})();

(() => {
  const block = (event) => {
    event.preventDefault();
  };

  document.addEventListener("copy", block);
  document.addEventListener("cut", block);
  document.addEventListener("contextmenu", block);
  document.addEventListener("dragstart", block);

  document.addEventListener("selectstart", (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("input, textarea")) {
      return;
    }

    event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "c" || key === "x") {
      event.preventDefault();
    }
  });
})();

