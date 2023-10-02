import {
    marginForSlidersCircle,
    sliderStyle,
    switchSlidesFromModule,
    switchClickModule,
    slider,
    switchOverModule,
    getQuantitySlides,
} from "/frontend/web/js/inside-project/modules/slider_module.js";
import { oneSwitchPage, switchPage, pagination } from "/frontend/web/js/inside-project/modules/pagination_module.js";
import { dateMask, chartTransform } from "/frontend/web/js/modules/dateMask.js";
import { validationFieldLength, validationEqualLong } from "/frontend/web/js/modules/validation.js";
import { errosAll } from "/frontend/web/js/inside-project/modules/errors_module.js";
const app = new Vue({
    el: "#portal",
    components: {
        apexchart: VueApexCharts,
    },
    data() {
        return {
            loader: false,
            pagination: {},
            configApp: {
                autoSwitchingSlider: true,
            },
            userSubmitVal: false,
            slider: {},
            filters: {
                onlyQuiz: false,
                date: {
                    dateFrom: "",
                    dateBy: "",
                    dateFromInputDate: "",
                    dateByInputDate: "",
                    notChangeInputDateBy: false,
                    notChangeInputDateFrom: false,
                    dateFromClass: "",
                    dateByClass: "",
                    isReverseDate: false,
                },
                search: "",
                isFocusSearch: false,
                errors: {
                    dateFrom: true,
                    dateBy: true,
                    search: true,
                },
            },
            filtersState: {
                setFilters: false,
                filtersFound: false,
                activeResetFilters: false,
                changeFilters: false,
                resetFiltersAll: false,
                oldFilters: {},
                isTextWithFiltersGet: true,
            },
            selectOption: {
                tags: {
                    showList: false,
                    isClickList: false,
                    sortValues: [],
                    values: [],
                    inputVal: "",
                    allSelectTags: [],
                    sliceTags: 20,
                },
                date: {
                    showList: false,
                },
            },
            informationFeed: [],
            textFields: {
                offerNews: {
                    text: "",
                    error: true,
                    click: false,
                    post: false,
                    chipping: "Ваша заявка на размещение новости отправлена на модерацию.",
                    postError: false,
                    setNews: false,
                },
            },
            isSliderComplete: true,
            isSliderLoader: true,
            isSliderNews: true,
            loaderQuiz: false,
            users: {},
            isInformationFeedLoad: false,
            hintsVisible: false,
            hints: [],
            getHintsLoader: true,
            hintsFound: false,
            newInformationFeed: {
                lastDate: {},
                informationNumber: {
                    news: 0,
                    quizes: 0,
                },
                timerNewInformation: 60 * 1000 * 5,
            },
            windowFlashing: null,
            windowFlashingPeriod: 1000,
            brendbookColors: [
                "#F1B8D7",
                "#76C3E9",
                "#73CDAF",
                "#C4DE8F",
                "#64E7D7",
                "#96BEED",
                "#C295C9",
                "#FF8888",
                "#FFC48E",
                "#F6A4DF",
                "#C1A4FF",
            ],
            tagsColors: {},
            elseError: false,
            errorMassage: "",
            errorTitle: "",
            btnDesibled: false,
            wasPagination: false,
            // переменная для cansel token пагинации
            sourcePagination: null,
            // переменная для cansel token подсказок
            sourceFind: null,
            swipeParamsX: 0,
            swipeParamsY: 0,
            paginationTagsPeriod: 1500,
            loaderVar: null,
            initVue: true,
            isInitRequest: true,
            isDate: false,
        };
    },

    watch: {
        "filters.date.dateFrom": function (val) {
            if (this.isDate === false) {
                let paramsArray = this.convertDate(val);
                let validate = this.validationDates(paramsArray[0], "From");
                this.setDates(paramsArray, validate, "From");
            }
        },
        "filters.date.dateBy": function (val) {
            if (this.isDate === false) {
                let paramsArray = this.convertDate(val);
                let validate = this.validationDates(paramsArray[0], "By");
                this.setDates(paramsArray, validate, "By");
            }
        },
        "filters.date.dateFromInputDate": function (val) {
            if (this.isDate === false) {
                this.filtersDateInputDate(val, "From");
            }
        },
        "filters.date.dateByInputDate": function (val) {
            if (this.isDate === false) {
                this.filtersDateInputDate(val, "By");
            }
        },
        "pagination.nextPage": function (val) {
            if (this.pagination.currentPage != val) {
                if (this.pagination.isBlur) {
                    this.pagination.currentPage = this.pagination.nextInput;
                    this.pagination.isBlur = false;
                    this.pagination.paginationLoad = true;
                    this.paginationLoaderSwitch(null);
                }

                let data = {
                    page: this.pagination.currentPage,
                    "per-page": val,
                };
                this.getContent(data, false, false, true);
            }
        },
        "filtersState.setFilters": function (val) {
            if (val === true) {
                this.filtersState.changeFilters = true;
                this.activeLoader("filters");
            }
        },
        informationFeed: function () {
            if (this.filtersState.changeFilters === true) {
                this.filtersState.activeResetFilters = true;
            }
        },
    },

    created() {
        this.calendarMargin();
        this.getContent();
        this.paginationCreated();
        this.loaderSwitch();
        this.getNewData();
        window.addEventListener("scroll", this.loaderSwitch);
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".drop-down-list_tags")) {
                this.selectOption.tags.showList = false;
            }
            if (!e.target.closest(".search_block")) {
                this.hintsVisible = false;
            }
        });
    },
    methods: {
        /**
         * Присвоение инпутам корректных дат
         *
         * @param {Object} params - параметры после валидации
         * @param {Boolean} valResult - результат валидации
         * @param {String} dateType - тип даты (from/by)
         *
         * @return undefined
         */
        setDates: function (params, valResult, dateType) {
            this.filters.date[`date${dateType}Class`] = params[2];
            if (params[3] !== null) {
                this.filters.date[`date${dateType}InputDate`] = params[0];
            }
            if (valResult) {
                this.filters.date[`date${dateType}`] = params[0];
                this.filters.date[`date${dateType}InputDate`] = params[1];
            } else {
                let dFrom = dateType === "From" ? params[0] : this.filters.date.dateFrom;
                let dBy = dateType === "By" ? params[0] : this.filters.date.dateBy;

                let dFromInput = dateType === "From" ? params[1] : this.filters.date.dateFromInputDate;
                let dByInput = dateType === "By" ? params[1] : this.filters.date.dateByInputDate;
                this.isDate = true;
                this.filters.date.dateBy = dFrom;
                this.filters.date.dateFrom = dBy;

                this.filters.date.dateByInputDate = dFromInput;
                this.filters.date.dateFromInputDate = dByInput;
            }
        },

        /**
         * Конвертация даты к нужному значению
         *
         * @param {String} val - значение input
         *
         * @return Object - получившиеся параметры после конвертации
         */
        convertDate: function (val) {
            let newMaskVal = dateMask(val, true);
            let newClass = this.switchClassDataFirst(true);
            let notChangeInputDate = false;
            let inputDate = null;
            if (val.length == 14) {
                let newVal = this.correctInvalidDate(newMaskVal);
                if (newVal != newMaskVal) {
                    notChangeInputDate = true;
                }
                newMaskVal = newVal;
                let dataTokens = val.split(" / ");

                inputDate = dataTokens[2] + "-" + dataTokens[1] + "-" + dataTokens[0];
            }
            return [newMaskVal, inputDate, newClass, notChangeInputDate];
        },

        /**
         * Валидация текстовых инпутов даты
         *
         * @param {String} val - значение input
         * @param {String} type - тип даты (from/by)
         *
         * @return Boolean - результат валидации
         */
        validationDates: function (val, type) {
            let dFrom = type === "From" ? val : this.filters.date.dateFrom;
            let dBy = type === "By" ? val : this.filters.date.dateBy;
            let oldDateFrom = dFrom.replaceAll(" / ", "-").replaceAll(".", "-");
            let oldDateBy = dBy.replaceAll(" / ", "-").replaceAll(".", "-");

            let dateFrom = new Date(
                oldDateFrom.slice(6, 10),
                oldDateFrom.slice(3, 5) - 1,
                oldDateFrom.slice(0, 2),
            ).toLocaleString("ru", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            });
            let dateBy = new Date(
                oldDateBy.slice(6, 10),
                oldDateBy.slice(3, 5) - 1,
                oldDateBy.slice(0, 2),
            ).toLocaleString("ru", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            });

            if (oldDateFrom.length === 10 && oldDateBy.length === 10 && dateFrom > dateBy) {
                return false;
            }
            return true;
        },

        /**
         * Валидация календарика даты
         *
         * @param {String} val - значение input
         * @param {String} dateType - тип даты (from/by)
         *
         * @return undefined
         */
        filtersDateInputDate: function (val, dateType) {
            if (val !== null && val.length == 10 && this.filters.date[`notChangeInputDate${dateType}`] == false) {
                let oldDate = new Date(val.replaceAll(/-/g, "/"));
                if (typeof this.filters.date[`date${dateType}`] !== "object") {
                    this.filters.date[`date${dateType}`] = new Date(
                        oldDate.getFullYear(),
                        oldDate.getMonth(),
                        oldDate.getDate(),
                    ).toLocaleString("ru", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                    });
                }
            } else if (val && val.length == 0) {
                this.filters.date[`date${dateType}`] = "";
            }
            this.filters.date[`notChangeInputDate${dateType}`] = false;
        },
        /**
         * Начало touch по слайдеру
         *
         * @return undefined
         */
        startTouch: function () {
            this.swipeParamsX = event.touches[0].clientX;
            this.swipeParamsY = event.touches[0].clientY;
        },
        /**
         * Событие touch по слайдеру
         *
         * @return undefined
         */
        moveTouch: function () {
            if (this.swipeParamsX === null) {
                return;
            }

            if (this.swipeParamsY === null) {
                return;
            }

            let currentX = event.touches[0].clientX;
            let currentY = event.touches[0].clientY;

            let diffX = this.swipeParamsX - currentX;
            let diffY = this.swipeParamsY - currentY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    let nextSlide = this.slider.activeSlide + 1;

                    if (this.slider.activeSlide == this.slider.quantitySlides - 1) {
                        nextSlide = 0;
                    }
                    marginForSlidersCircle(nextSlide);
                } else {
                    let nextSlide = this.slider.activeSlide - 1;
                    if (this.slider.activeSlide == 0) {
                        nextSlide = this.slider.quantitySlides - 1;
                    }
                    marginForSlidersCircle(nextSlide);
                }
            }

            this.swipeParamsX = null;
            this.swipeParamsY = null;
        },
        /**
         * Создание параметров для получения контента
         *
         * @param {Object} dataSearch - фильтры
         * @param {Boolean} isNewInformation - получение ли новой ленты
         *
         * @return Object - параметры для получения контента
         */
        createGetContentParams: function (dataSearch, isNewInformation) {
            this.wasPagination = true;
            let params = {};
            let setParams = {};
            if (dataSearch) {
                params = dataSearch;
            }
            this.btnDesibled = true;
            for (let item in params) {
                let url = window.location.href;
                if (item != "per-page") {
                    window.history.pushState({}, null, this.updateURLParameter(url, item, params[item]));
                }
            }
            setParams = new URLSearchParams(window.location.search);
            let per_page = undefined;
            if (params["per-page"] !== undefined) {
                per_page = `&per-page=${params["per-page"]}`;
            }
            if (setParams.get("page") !== null && params["per-page"] === undefined) {
                per_page = `&per-page=${setParams.get("page")}`;
            }
            if (isNewInformation == true) {
                setParams = "";
            }
            return { setParams: setParams, per_page: per_page };
        },
        /**
         * Получение контента для портала
         *
         * @param {Object} dataSearch - фильтры
         * @param {Boolean} isNewInformation - получение ли новой ленты
         * @param {Boolean} isOnlyText - в фильтрах только текст или нет
         * @param {Boolean} isPagination - пагинация ли
         *
         * @return undefined
         */
        getContent: async function (dataSearch, isNewInformation = false, isOnlyText = false, isPagination = false) {
            this.getHints(false);
            let params = this.createGetContentParams(dataSearch, isNewInformation);
            let setParams = params.setParams;
            let per_page = params.per_page;
            if (isPagination == true && this.wasPagination == true) {
                if (this.sourcePagination) {
                    this.sourcePagination.cancel();
                }
            }
            if (
                (this.isInitRequest === false &&
                    JSON.stringify(this.createFiltersData(isOnlyText)[0]) !=
                        JSON.stringify(this.filtersState.oldFilters) &&
                    !this.isFiltersEmpty(setParams) &&
                    isPagination === false) ||
                this.filtersState.setFilters ||
                this.filtersState.resetFiltersAll
            ) {
                per_page = "&per-page=1";
            }
            this.isInitRequest === true ? (this.isInitRequest = false) : false;
            this.sourcePagination = axios.CancelToken.source();
            await axios
                .get(`/inside/get?${setParams + per_page}`, {
                    cancelToken: this.sourcePagination.token,
                })
                .then((res) => {
                    this.createFeed(res, dataSearch, isOnlyText, this.createFiltersData(isOnlyText)[0]);
                })
                .catch((err) => {
                    this.contentError();
                });
        },

        isFiltersEmpty(data) {
            let filtersData = Object.fromEntries(data);
            delete filtersData["page"];
            let emptyCount = 0;
            for (let el in filtersData) {
                if (filtersData[el] !== "" && filtersData[el] !== false) {
                    emptyCount++;
                }
            }
            return emptyCount === 0;
        },
        /**
         * Обработка ошибки при получении контента
         *
         * @return undefined
         */
        contentError: function () {
            this.elseError = true;
            this.removeLoader();
        },
        /**
         * Создание ленты после полчения контента для портала
         *
         * @param {Object} res - результат получения контента
         * @param {Object} dataSearch - фильтры
         * @param {Boolean} isOnlyText - в фильтрах только текст или нет
         *
         * @return undefined
         */
        createFeed: function (res, dataSearch, isOnlyText, filtersDate) {
            this.filtersState.oldFilters = {
                ...filtersDate,
            };
            if (res.status == 200) {
                if (!dataSearch || !this.slider.slides) {
                    this.initHeadInfo(res.data.content);
                }
                let url = window.location.href;
                this.initPagination(res.data.pagination);
                window.history.pushState({}, null, this.updateURLParameter(url, "page", this.pagination.currentPage));
                this.initTagsColor(res.data.content);
                this.initInformationFeed(res.data.content);
                this.initUsers(res.data.users);
                this.newInformationFeed.lastDate = res.data.lastDateContent;
                this.initTags(res.data.filter);
                this.initAllFilters(res.data.filter);
                this.isInformationFeedLoad = true;
            } else {
                this.elseError = true;
                setTimeout(() => {
                    this.elseError = false;
                }, 2500);
            }
            if (res) {
                this.filtersState.setFilters = false;
                this.filtersState.resetFiltersAll = false;
                this.filtersState.filtersFound = true;
                this.pagination.paginationLoad = false;

                if (isOnlyText && !this.filtersValidation()) {
                    this.filtersState.activeResetFilters = false;
                }
                this.btnDesibled = false;
                setTimeout(() => (this.wasPagination = false), 1000);
            }
        },
        /**
         * Инициализация фильтров
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initAllFilters: function (data) {
            this.selectOption.tags.allSelectTags = this.createFiltersData(false)[1];
            data.search == null
                ? (this.filters.search = "")
                : ((this.filters.search = data.search), (this.filtersState.changeFilters = true));
            data.date_end == null
                ? (this.filters.date.dateBy = "")
                : ((this.filters.date.dateBy = data.date_end), (this.filtersState.changeFilters = true));
            data.date_start == null
                ? (this.filters.date.dateFrom = "")
                : ((this.filters.date.dateFrom = data.date_start), (this.filtersState.changeFilters = true));
            data.onlyQuiz == false
                ? (this.filters.onlyQuiz = false)
                : ((this.filters.onlyQuiz = data.onlyQuiz), (this.filtersState.changeFilters = true));
            data.news_id == null ? false : (this.filtersState.changeFilters = true);
            data.quiz_id == null ? false : (this.filtersState.changeFilters = true);
            data.tags == null ? false : (this.filtersState.changeFilters = true);
        },
        /**
         * Инициализация тегов
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initTags: function (data) {
            let tags = data.filterTags;
            let tagsSelect = data.tags;
            for (let item in tags) {
                tags[item].checked = false;
                for (let itemTags in tagsSelect) {
                    if (tags[item].id == tagsSelect[itemTags]) {
                        tags[item].checked = true;
                    }
                }
            }
            this.selectOption.tags.values = tags;
            this.selectOption.tags.sortValues = this.sortTags(tags);
        },
        /**
         * Замена не валидной даты на валидную
         *
         * @param {Object} date - старая дата
         *
         * @return {Object} - новая дата
         */
        correctInvalidDate: function (date) {
            let arrayDate = date.split(" / ");
            let oldDate = `${arrayDate[2]}-${arrayDate[1]}-${arrayDate[0]}`;
            let newDate = new Date(oldDate).toLocaleString("ru", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            });
            return newDate.replaceAll(".", " / ");
        },
        /**
         * Пагинация тегов
         *
         * @return undefined
         */
        paginationTags: function () {
            if (event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight) {
                let newNumber = this.selectOption.tags.sliceTags + 20;
                let valLength = this.selectOption.tags.values.length;

                setTimeout(() => {
                    if (newNumber < valLength || newNumber == valLength) {
                        this.selectOption.tags.sliceTags = newNumber;
                    } else if (newNumber > valLength) {
                        this.selectOption.tags.sliceTags = valLength;
                    }
                }, this.paginationTagsPeriod);
            }
        },
        /**
         * Принудительное открытие новости в мобильной версии
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        openMobileNews: function (news) {
            let windowWidth = window.innerWidth;
            if (windowWidth <= 790) {
                news.readCompletely = true;
            }
        },
        /**
         * Скролл тегов и сброс пагинации
         *
         * @return undefined
         */
        inputTags: function () {
            document.getElementsByClassName("departaments_list")[0].scroll({
                top: 0,
                behavior: "smooth",
            });
            this.selectOption.tags.sliceTags = 20;
            this.selectOption.tags.sortValues = this.sortTags(this.selectOption.tags.values);
        },
        /**
         * Создание строки с параметрами для адресной строки
         *
         * @param {String} url - старый url
         * @param {String} param - название параметра
         * @param {String} paramVal - значение параметра
         *
         * @return {String} - новая ссылка с учетом параметров
         */
        updateURLParameter: function (url, param, paramVal) {
            let tempArray = url.split("?");
            let baseURL = tempArray[0];
            if (paramVal == "" || paramVal == false || paramVal == null) {
                const params = new URLSearchParams(window.location.search);
                params.delete(param);
                let allParams = params.toString();
                if (allParams.length == 0) {
                    return baseURL;
                } else {
                    return baseURL + "?" + decodeURI(allParams);
                }
            } else {
                let theParams = null;
                let newAdditionalURL = "";

                let additionalURL = tempArray[1];
                let temp = "";

                if (additionalURL) {
                    let tmpAnchor = additionalURL.split("#");
                    let TheParams = tmpAnchor[0];
                    theParams = tmpAnchor[1];
                    if (theParams) additionalURL = TheParams;

                    tempArray = additionalURL.split("&");

                    for (let i = 0; i < tempArray.length; i++) {
                        if (tempArray[i].split("=")[0] != param) {
                            newAdditionalURL += temp + tempArray[i];
                            temp = "&";
                        }
                    }
                } else {
                    let tmpAnchor = baseURL.split("#");
                    let TheParams = tmpAnchor[0];
                    theParams = tmpAnchor[1];

                    if (TheParams) baseURL = TheParams;
                }

                if (theParams) paramVal += "#" + theParams;

                let rows_txt = temp + param + "=" + paramVal;
                return baseURL + "?" + newAdditionalURL + rows_txt;
            }
        },
        /**
         * Инициализация слайдов
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initHeadInfo: function (data) {
            this.slider = slider;
            this.slider.slides = data.headInfo;
            if (this.slider.slides.length > 0) {
                for (let item in this.slider.slides) {
                    let oldDate = new Date(this.slider.slides[item].created.replaceAll(/-/g, "/"));
                    this.slider.slides[item].created = new Date(
                        oldDate.getFullYear(),
                        oldDate.getMonth(),
                        oldDate.getDate(),
                    ).toLocaleString("ru", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                    });
                }
                getQuantitySlides();
            } else {
                this.isSliderComplete = false;
            }
            this.isSliderLoader = false;
            this.removeLoader();

            this.calendarMargin();
            getQuantitySlides();
            this.sliderCreated();
        },
        /**
         * Высчитывание отступа для календаря
         *
         * @param {Number} sliderNumber - порядковый номер слайда
         *
         * @return undefined
         */
        calendarMargin: function () {
            if (this.isSliderComplete === false) {
                document.getElementsByClassName("calendar_block")[0].style.marginTop = "137px";
            } else if (this.isSliderComplete === true) {
                document.getElementsByClassName("calendar_block")[0].style.marginTop = "";
            }
        },
        /**
         * Инициализация ленты новостей и опросов
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initInformationFeed: function (data) {
            let informationFeed = new Array();
            this.initInsideNews(data.news).forEach((el) => {
                informationFeed.push(el);
            });
            if (data.quizes.quizes) {
                this.initInsideQuizes(data.quizes.quizes).forEach((el) => {
                    informationFeed.push(el);
                });
            } else {
                this.initInsideQuizes(data.quizes).forEach((el) => {
                    informationFeed.push(el);
                });
            }
            informationFeed = informationFeed.sort(function (a, b) {
                return new Date(b.created) - new Date(a.created);
            });
            this.informationFeed = informationFeed;
            if (
                this.informationFeed[this.informationFeed.length - 1] &&
                this.informationFeed[this.informationFeed.length - 1].type == "news"
            ) {
                if (this.informationFeed[this.informationFeed.length - 1].commentsLength > 20) {
                    this.informationFeed[this.informationFeed.length - 1].lastNews = true;
                }
            }

            this.isSliderNews = false;
            this.removeLoader();
        },
        /**
         * Инициализация пользователей
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initUsers: function (data) {
            let users = new Object(data);
            this.users = users;
        },
        /**
         * Инициализация новостей
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initInsideNews: function (data) {
            let informationNews = new Object(data);
            for (let item in informationNews) {
                let oldDate = new Date(informationNews[item].created.replaceAll(/-/g, "/"));
                informationNews[item].newCreated = new Date(
                    oldDate.getFullYear(),
                    oldDate.getMonth(),
                    oldDate.getDate(),
                ).toLocaleString("ru", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                });
                informationNews[item].type = "news";
                informationNews[item].readCompletely = false;
                informationNews[item].post = false;
                this.openMobileNews(informationNews[item]);
                this.initComments(informationNews[item]);
                this.changeVideoRender(informationNews[item]);
                this.changeHref(informationNews[item]);
            }

            return informationNews;
        },
        /**
         * Инициализация комментариев
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        initComments: function (news, comments = null) {
            news.commentsOpen = false;
            if (comments != null) {
                for (let item in comments) {
                    news.userComments.unshift(comments[item]);
                    news.commentsOpen = true;
                }
            } else if (comments != null) {
                news.commentsOpen = false;
            }
            news.commentsLength = news.numberComments;

            news.commentText = "";
            news.commentError = true;
            news.commentErrorShow = false;
            for (let i in news.userComments) {
                let commentDate = new Date(news.userComments[i].created.replace(/-/g, "/"));
                news.userComments[i].createdDay = new Date(
                    commentDate.getFullYear(),
                    commentDate.getMonth(),
                    commentDate.getDate(),
                ).toLocaleString("ru", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                });
                news.userComments[i].createdTime =
                    commentDate.getHours() +
                    ":" +
                    ((commentDate.getMinutes() < 10 ? "0" : "") + commentDate.getMinutes());
            }
            this.initPaginationComments(news);
        },
        /**
         * Инициализация пагинации
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initPagination: function (data) {
            this.pagination.allPage = data.totalPages;
            this.pagination.rightPage = data.totalPages;
            this.pagination.currentPage = data.page;
            this.pagination.nextInput = data.page;
            this.pagination.nextPage = data.page;
            this.removeLoader();
        },
        /**
         * Инициализация пагинации комментариев
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        initPaginationComments: function (news) {
            news.pagination = {
                ...pagination,
            };
            news.pagination.allPage = news.commentsPaginate.totalPages;
            news.pagination.rightPage = news.commentsPaginate.totalPages;
            news.pagination.currentPage = news.commentsPaginate.page;
            news.pagination.nextInput = news.commentsPaginate.page;
            news.pagination.nextPage = news.commentsPaginate.page;
            this.removeLoader();
        },
        /**
         * Инициализация новостей
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        initInsideQuizes: function (data) {
            let informationQuizes = new Object(data);
            for (let item in informationQuizes) {
                informationQuizes[item].type = "quiz";

                informationQuizes[item].checked = false;
                informationQuizes[item].showTextarea = false;
                informationQuizes[item].ownVersion = {
                    isIt: false,
                    text: "",
                    isError: true,
                };
                if (informationQuizes[item].isVoted === false) {
                    informationQuizes[item] = this.createQuizesParams(informationQuizes[item]);
                } else {
                    if (informationQuizes[item].diagram_type == "pie") {
                        informationQuizes[item].apexchart = this.createApexChart(informationQuizes[item].results);
                    } else if (informationQuizes[item].diagram_type == "bar") {
                        informationQuizes[item].barAnswers = this.createBarChart(informationQuizes[item].results);
                    }
                }
                this.changeVideoRender(informationQuizes[item]);
                this.changeHref(informationQuizes[item]);
            }
            return informationQuizes;
        },
        createQuizesParams: function (item) {
            item.answers.forEach((el) => {
                if (el.type == "radio") {
                    item.typeQuiz = "radio";
                } else if (el.type == "checkbox") {
                    item.typeQuiz = "checkbox";
                    item.checked = [];
                } else if (el.type == "open") {
                    if (item.answers.length == 1) {
                        item.showTextarea = true;
                    }
                    item.ownVersion.isIt = true;
                    item.ownVersion.title = el.title;
                    item.ownVersion.id = el.id;
                    item.ownVersion.isErrorText = false;
                    item.answers.splice(item.answers.indexOf(el), 1);
                }
            });
            return item;
        },
        /**
         * Закрытие новостей
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        closeNews: function (news) {
            news.readCompletely = false;
            news.commentsOpen = false;
            window.scrollBy({
                left: this.offsetNews(event).left,
                top: this.offsetNews(event).top,
                behavior: "auto",
            });
        },
        /**
         * Прокрутка новости
         *
         * @param {Object} event - событие новости
         *
         * @return undefined
         */
        offsetNews: function (event) {
            let rect = event.target
                .closest(".news-block")
                .getElementsByClassName("date-block")[0]
                .getBoundingClientRect();
            return {
                top: rect.top - 20,
                left: rect.left,
            };
        },
        /**
         * Инициализация слайдера
         *
         * @return undefined
         */
        sliderCreated: function () {
            this.switchSlides();
            sliderStyle();
        },
        /**
         * Инициализация пагинации
         *
         * @return undefined
         */
        paginationCreated: function () {
            if (this.pagination.nextPage) {
                pagination.nextPage = Number(this.pagination.nextPage);
            }
            this.pagination = {
                ...pagination,
            };
        },
        /**
         * Вызывает функцию высчитавающую позицию кружочка-переключателя (из модуля слайдера)
         *
         * @param {Number} sliderNumber - порядковый номер слайда
         *
         * @return undefined
         */
        sliderCounterMargin: function (sliderNumber) {
            marginForSlidersCircle(sliderNumber);
        },
        /**
         * Перелистывание слайдов
         *
         * @return undefined
         */
        switchSlides: function () {
            setInterval(() => {
                switchSlidesFromModule();
            }, this.slider.sliderPeriod);
        },
        /**
         * Вызывает функцию запускающую автоматическое пролистывание слайдов после mouseleave (из модуля слайдера)
         *
         * @return undefined
         */
        switchClick: function () {
            switchClickModule();
        },
        /**
         * Вызывает функцию останавливающую автоматическое пролистывание слайдов (из модуля слайдера)
         *
         * @return undefined
         */
        switchOver: function () {
            switchOverModule();
        },
        /**
         * Поремещает обзор пользователя на верх страницы
         *
         * @return undefined
         */
        scrollToTop: function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        /**
         * Валидация textarea
         *
         * @return undefined
         */
        validationOfferNews: function () {
            this.textFields.offerNews.click = false;
            if (validationFieldLength(this.textFields.offerNews.text, 32, 1024)) {
                this.textFields.offerNews.error = false;
                this.textFields.offerNews.click = false;
            } else {
                this.textFields.offerNews.error = true;
            }
        },
        /**
         * Валидация textarea
         *
         * @return undefined
         */
        validationOpenAnswer: function (val) {
            if (validationFieldLength(val.text, 1, 255)) {
                val.isError = false;
            } else {
                val.isError = true;
            }
        },
        /**
         * Событие при клике вне selectOption
         *
         * @return undefined
         */
        selectOptionFocusout: function () {
            if (this.selectOption.tags.isClickList === false) {
                this.selectOption.tags.showList = false;
            } else {
                this.selectOption.tags.isClickList = false;
            }
        },
        /**
         * Вызов функции на переключение страниц на 1 единицу
         *
         * @param {Boolean} isLeftPage - является ли кликом на предыдущую страницу
         * @param {Object} pagination - объект пагинации
         * @param {Object} news - выбранная новость
         *
         * @return undefined
         */
        switchOnePage: function (isLeftPage, pagination, news = null) {
            if (news == null) {
                oneSwitchPage(isLeftPage, pagination);
                if (
                    (pagination.currentPage > 1 && isLeftPage == -1) ||
                    (pagination.currentPage < pagination.allPage && isLeftPage == 1)
                ) {
                    this.pagination.paginationLoad = true;
                    this.paginationLoaderSwitch(news);
                }
            } else if (news != null) {
                oneSwitchPage(isLeftPage, news.pagination);

                if (
                    (news.pagination.currentPage > 1 && isLeftPage == -1) ||
                    (news.pagination.currentPage < news.pagination.allPage && isLeftPage == 1)
                ) {
                    if (news.pagination.currentPage != news.pagination.nextPage) {
                        news.pagination.paginationLoad = true;
                        news.pagination.currentPage = news.pagination.nextPage;
                        this.getCommentPage(news, event);
                        this.paginationLoaderSwitch(news);
                    }
                }
            }
        },
        /**
         * Вызов функции на переключение страниц на ~100 единиц
         *
         * @param {Boolean} isLeftPage - нажата ли  самая левая кнопка
         * @param {Object} pagination - объект пагинации
         * @param {Object} new - новость
         *
         * @return undefined
         */
        moreSwitchPage: function (isLeftPage, pagination, news = null) {
            if (news == null) {
                switchPage(isLeftPage, pagination);
                if (
                    (pagination.currentPage > 1 && isLeftPage == true) ||
                    (pagination.currentPage < pagination.allPage && isLeftPage == false)
                ) {
                    this.pagination.paginationLoad = true;
                    this.paginationLoaderSwitch(news);
                }
            } else if (news != null) {
                switchPage(isLeftPage, news.pagination);

                if (
                    (news.pagination.currentPage > 1 && isLeftPage == true) ||
                    (news.pagination.currentPage < news.pagination.allPage && isLeftPage == false)
                ) {
                    if (news.pagination.currentPage != news.pagination.nextPage) {
                        news.pagination.paginationLoad = true;
                        news.pagination.currentPage = news.pagination.nextPage;
                        this.getCommentPage(news, event);
                        this.paginationLoaderSwitch(news);
                    }
                }
            }
        },

        /**
         * Выход из аккаунта
         */
        logout: async function () {
            this.btnDesibled = true;
            await axios
                .post("/site/logout", {})
                .then((res) => {
                    if (res.data.res) {
                        window.location.href = "/inside/auth";
                    } else {
                        this.elseError = true;
                        this.btnDesibled = false;
                        setTimeout(() => {
                            this.elseError = false;
                        }, 2500);
                    }
                })
                .catch((error) => {
                    this.elseError = true;
                    this.btnDesibled = false;
                    setTimeout(() => {
                        this.elseError = false;
                    }, 2500);
                });
        },
        /**
         * Отправка предложенной новости
         *
         * @return undefined
         */
        offerNews: async function () {
            let text = this.textFields.offerNews.text;
            this.textFields.offerNews.click = true;
            this.errorMassage = "";

            if (this.textFields.offerNews.error === false) {
                this.btnDesibled = true;
                this.textFields.offerNews.setNews = true;
                this.activeLoader("offer-news");
                await axios
                    .post("/inside/offer-news", {
                        text,
                    })
                    .then((res) => {
                        if (res.data.res) {
                            this.textFields.offerNews.setNews = false;
                            this.removeLoader();
                            this.textFields.offerNews.text = "";
                            this.textFields.offerNews.click = false;
                            this.textFields.offerNews.error = true;
                            this.textFields.offerNews.postError = false;
                            this.textFields.offerNews.post = true;
                            setTimeout(() => {
                                this.textFields.offerNews.post = false;
                            }, 2500);
                            this.btnDesibled = false;
                        } else {
                            this.textFields.offerNews.setNews = false;
                            this.removeLoader();
                            let error = {
                                request: {
                                    status: 422,
                                },
                            };
                            this.handlingError(
                                error,
                                "При отправке новости произошла ошибка. Попробуйте повторить отправку позже.",
                                "Ошибка отправки новости",
                            );
                            this.textFields.offerNews.chipping = this.errorMassage;
                            this.textFields.offerNews.postError = true;
                            this.textFields.offerNews.post = true;
                            setTimeout(() => {
                                this.textFields.offerNews.post = false;
                            }, 3500);
                        }
                    })
                    .catch((error) => {
                        this.textFields.offerNews.setNews = false;
                        this.removeLoader();
                        this.handlingError(
                            error,
                            "При отправке новости произошла ошибка. Попробуйте повторить отправку позже.",
                            "Ошибка отправки новости",
                        );
                        this.textFields.offerNews.chipping = this.errorMassage;
                        this.textFields.offerNews.postError = true;
                        this.textFields.offerNews.post = true;
                        setTimeout(() => {
                            this.textFields.offerNews.post = false;
                        }, 3500);
                    });
            }
        },
        /**
         * Открытие комментариев
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        switchCommentsVisibility: function (news) {
            if (news.readCompletely === false) {
                news.readCompletely = true;
                let newsHeight = event.target
                    .closest(".news-block")
                    .getElementsByClassName("ck-content")[0]
                    .getElementsByTagName("div")[0].clientHeight;
                let openCommentBlock = document.createElement("div");
                openCommentBlock.classList.add("news-open-comment_block");
                let scrollVal = newsHeight + event.target.closest(".news-block").getBoundingClientRect().top - 15;
                openCommentBlock.style.height = scrollVal + "px";
                let bodyBlock = event.target.closest("body");
                bodyBlock.appendChild(openCommentBlock);
                window.scrollBy({
                    left: 0,
                    top: scrollVal,
                    behavior: "smooth",
                });
                window.onscroll = (e) => {
                    let currentScrollOffset = window.pageYOffset || document.documentElement.scrollTop;
                    if (currentScrollOffset === scrollVal) {
                        if (bodyBlock.getElementsByClassName("news-open-comment_block")[0]) {
                            bodyBlock.getElementsByClassName("news-open-comment_block")[0].remove();
                        }
                        window.onscroll = null;
                    }
                };
            }
            news.commentsOpen = !news.commentsOpen;
        },
        /**
         * Закрытие комментариев
         *
         * @param {Object} event - событие новости
         *
         * @return undefined
         */
        offsetComment: function (event) {
            let rect = event.target
                .closest(".news-block")
                .getElementsByClassName("read-completely")[0]
                .getBoundingClientRect();
            return {
                top: rect.top - 20,
                left: rect.left,
            };
        },
        /**
         * Валидация при написании комментария
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        validationComment: function (news) {
            if (validationFieldLength(news.commentText, 1, 255)) {
                news.commentError = false;
            } else {
                news.commentError = true;
            }
        },
        /**
         * Отправка комментария
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        offerComment: async function (news) {
            this.validationComment(news);
            let comment = {};
            if (news.userComments.length != 0) {
                comment = {
                    news_id: news.id,
                    text: news.commentText,
                    lastDate: news.userComments[0].created,
                };
            } else {
                comment = {
                    news_id: news.id,
                    text: news.commentText,
                    lastDate: null,
                };
            }
            if (news.commentError === false) {
                news.setComment = true;
                this.activeLoader(`comments-block${news.id}`);
                this.btnDesibled = true;
                await axios
                    .post("/inside/set-comment", {
                        comment,
                    })
                    .then((res) => {
                        if (res.data.res) {
                            this.removeLoader();
                            news.setComment = false;
                            news.numberComments = res.data[0].numberComments;
                            this.initComments(news, res.data[0].comments.slice().reverse());
                            this.btnDesibled = false;
                            news.chipping = "Ваш комментарий успешно отправлен";
                            news.post = true;
                            setTimeout(() => {
                                news.post = false;
                            }, 1500);
                        } else {
                            this.removeLoader();
                            news.setComment = false;
                            this.btnDesibled = false;
                            let error = {
                                request: {
                                    status: 422,
                                },
                            };
                            this.handlingError(
                                error,
                                "При отправке комментария произошла ошибка. Попробуйте повторить отправку позже.",
                                "Ошибка отправки комментария",
                            );
                            news.chipping = this.errorMassage || "Произошла ошибка";
                            news.postError = true;
                            news.post = true;
                            setTimeout(() => {
                                news.post = false;
                            }, 2000);
                        }
                    })
                    .catch((error) => {
                        this.removeLoader();
                        news.setComment = false;
                        this.btnDesibled = false;
                        this.handlingError(
                            error,
                            "При отправке комментария произошла ошибка. Попробуйте повторить отправку позже.",
                            "Ошибка отправки комментария",
                        );
                        news.chipping = this.errorMassage || "Произошла ошибка";
                        news.postError = true;
                        news.post = true;
                        setTimeout(() => {
                            news.post = false;
                        }, 2000);
                    });
            } else {
                news.commentErrorShow = true;
                setTimeout(() => {
                    news.commentErrorShow = false;
                }, 1000);
            }
        },
        /**
         * Создание даты для отправки ответа на опрос в зависимости от типа ответа/опроса
         *
         * @param {Object} el - опрос
         *
         * @return undefined
         */
        dispatchAnswer: function (el) {
            if (
                this.loaderQuiz == false &&
                !this.btnDesibled &&
                String(el.checked).length > 0 &&
                ((el.checked !== false && el.showTextarea === false) ||
                    (el.showTextarea && el.ownVersion.isError === false))
            ) {
                let answers = [];
                if (el.checked !== "userAnswer" && el.checked > -1 && String(el.checked).length > 0) {
                    answers = [
                        {
                            answer_id: Number(el.checked),
                            quiz_id: Number(el.id),
                            text: null,
                        },
                    ];
                } else if (el.checked === "userAnswer" && el.ownVersion.text.length > 0) {
                    answers = [
                        {
                            answer_id: Number(el.ownVersion.id),
                            quiz_id: Number(el.id),
                            text: el.ownVersion.text,
                        },
                    ];
                } else {
                    el.checked.forEach((item) => {
                        let answer = {};
                        if (item !== "userAnswer") {
                            answer = {
                                answer_id: Number(item),
                                quiz_id: Number(el.id),
                                text: null,
                            };
                        } else if (item === "userAnswer" && el.ownVersion.text.length > 0) {
                            answer = {
                                answer_id: Number(el.ownVersion.id),
                                quiz_id: Number(el.id),
                                text: el.ownVersion.text,
                            };
                        }
                        answers.push(answer);
                    });
                }
                el.loaderQuiz = true;
                this.removeLoader();
                this.loaderToQuiz(el.id);
                this.dispatchVote(answers, el);
            } else if (!(el.showTextarea && el.ownVersion.isError === false)) {
                el.ownVersion.isErrorText = true;
                setTimeout(() => {
                    el.ownVersion.isErrorText = false;
                }, 1000);
            }
        },
        createBarChart: function (newData) {
            let labelsSeries = {};
            let allAnswers = 0;
            let val = "";
            for (let item in newData) {
                allAnswers = allAnswers + newData[item];
            }
            for (let item in newData) {
                val = newData[item] / (allAnswers / 100);
                Number.isInteger(val) ? (labelsSeries[item] = val) : (labelsSeries[item] = val.toFixed(1));
            }
            return labelsSeries;
        },
        createApexChart: function (newData) {
            let apexchart = {
                series: [],
                chartOptions: {
                    chart: {
                        type: "pie",
                        height: 152,
                    },
                    labels: [],

                    legend: {
                        formatter: function (seriesName, opts) {
                            let precentVal =
                                opts.w.globals.series[opts.seriesIndex] /
                                (opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0) / 100);
                            return [
                                seriesName.replace(opts.w.globals.series[opts.seriesIndex], ""),
                                "&nbsp;&nbsp;&nbsp; ",
                                Number.isInteger(precentVal) ? precentVal + "%" : precentVal.toFixed(1) + "%",
                            ];
                        },
                    },
                    colors: this.brendbookColors,
                },
            };
            let labelsSeries = {};
            for (let item in newData) {
                labelsSeries[item] = newData[item];
            }
            for (let val in labelsSeries) {
                apexchart.series.push(labelsSeries[val]);
                apexchart.chartOptions.labels.push(val + " " + labelsSeries[val]);
            }

            return apexchart;
        },

        /**
         * Голосование
         *
         * @param {Object} answers - массив ответом
         * @param {Object} el - новость
         *
         * @return undefined
         */
        dispatchVote: async function (answers, el) {
            this.btnDesibled = true;
            await axios
                .post("/inside/vote", {
                    answers,
                })
                .then((res) => {
                    if (res.data.res) {
                        if (res.data.type === "pie") {
                            el.apexchart = this.createApexChart(res.data.quizResult);
                            this.loaderQuiz = false;
                        } else if (res.data.type === "bar") {
                            el.barAnswers = this.createBarChart(res.data.quizResult);
                            this.loaderQuiz = false;
                        }
                        this.btnDesibled = false;
                        el.loaderQuiz = false;
                        this.removeLoader();
                    } else {
                        let error = {
                            request: {
                                status: 422,
                            },
                        };
                        this.handlingError(
                            error,
                            "При отправке ответа на опрос произошла ошибка. Попробуйте повторить отправку позже.",
                            "Ошибка отправки ответа на опрос",
                        );
                        el.errorTitle = this.errorTitle;
                        el.errorMassage = this.errorMassage;
                        this.loaderQuiz = false;
                        el.loaderQuiz = false;
                        this.removeLoader();
                    }
                })
                .catch((error) => {
                    this.handlingError(
                        error,
                        "При отправке ответа на опрос произошла ошибка. Попробуйте повторить отправку позже.",
                        "Ошибка отправки ответа на опрос",
                    );
                    el.errorTitle = this.errorTitle;
                    el.errorMassage = this.errorMassage;
                    this.loaderQuiz = false;
                    el.loaderQuiz = false;
                    this.removeLoader();
                });
        },
        /**
         * Вызов функции на переключение классов 1 инпуту
         *
         * @param {Boolean} isFirstInput - на первом ли инпуте фокус
         *
         * @return {String} класс инпута
         */
        switchClassDataFirst: function (isFirstInput) {
            if (isFirstInput === true) {
                return chartTransform(isFirstInput)[0];
            } else {
                return chartTransform(isFirstInput)[1];
            }
        },

        /**
         * Присваивает текущее имя лоадера
         *
         * @param {Object} loaderVar - имя лоадера
         *
         * @return undefined
         */
        activeLoader: function (loaderVar) {
            this.loaderVar = loaderVar;
        },
        /**
         * Проверка находится ли объект в который будет вставлен loader в зоне видимости пользователя
         *
         * @param {Object} el - проверяемый html объект
         *
         * @return {Boolean} результат проверки
         */
        isVisible: function (el) {
            const targetClientVuePort = el.getBoundingClientRect();

            return (
                targetClientVuePort.bottom > 0 &&
                targetClientVuePort.right > 0 &&
                targetClientVuePort.left < (window.innerWidth || document.documentElement.clientWidth) &&
                targetClientVuePort.top < (window.innerHeight || document.documentElement.clientHeight)
            );
        },
        /**
         * Лоадер для опросов
         *
         * @param {Object} event - событие опроса
         * @param {Object} quiz - опрос
         *
         * @return undefined
         */
        loaderToQuiz: function (elId) {
            this.activeLoader(`quiz${elId}`);
        },
        /**
         * Перемещение loader
         *
         * @return undefined
         */
        loaderSwitch: function () {
            let loaderHeadInfo = document.getElementsByClassName("slider-main_news")[0],
                loaderNews = document.getElementsByClassName("information-feed_body")[0],
                loaderVarHeadInfo = "slider",
                loaderVarNews = "information-feed";

            if (
                loaderHeadInfo &&
                this.isVisible(loaderHeadInfo) &&
                this.loaderVar !== loaderVarHeadInfo &&
                this.isSliderLoader
            ) {
                this.activeLoader(loaderVarHeadInfo);
            } else if (loaderHeadInfo && !this.isVisible(loaderHeadInfo) && this.loaderVar === loaderVarHeadInfo) {
                this.removeLoader();
            }
            if (loaderNews && this.isVisible(loaderNews) && this.loaderVar !== loaderVarNews && this.isSliderNews) {
                this.activeLoader(loaderVarNews);
            } else if (loaderNews && !this.isVisible(loaderNews) && this.loaderVar === loaderVarNews) {
                this.removeLoader();
            }
        },
        /**
         * Удаляет loader
         *
         * @return undefined
         */
        removeLoader: function () {
            this.loaderVar = null;
        },
        /**
         * Создание даты для запроса с учетом фильтров
         *
         * @param {Boolean} isOnlyText - поиск только с фильтров search или нет
         *
         * @return {Object} - массив даты и массива тегов
         */
        createFiltersData: function (isOnlyText = false) {
            let data = {};
            this.filtersState.isTextWithFiltersGet = true;

            this.filters.errors.dateFrom === false
                ? (data.date_start = this.filters.date.dateFrom.replaceAll(" / ", "-"))
                : (data.date_start = "");
            this.filters.errors.dateBy === false
                ? (data.date_end = this.filters.date.dateBy.replaceAll(" / ", "-"))
                : (data.date_end = "");
            data.onlyQuiz = this.filters.onlyQuiz;

            data.news_id = "";
            data.quiz_id = "";
            data.search = this.filters.search;
            data = Object.assign(data, this.createTagsParams()[0]);

            return [data, this.createTagsParams()[1]];
        },
        /**
         * Создание массива тегов из фильтров
         *
         * @return {Object} - массив тегов
         */
        createTagsParams: function () {
            let tagsId = [];
            let objTags = {};
            let allTags = [];
            let isEmpty = true;
            for (let item in this.selectOption.tags.values) {
                if (this.selectOption.tags.values[item].checked == true) {
                    if (tagsId[item]) {
                        tagsId.item;
                    }
                    tagsId.push(this.selectOption.tags.values[item].id);
                }
            }
            if (this.selectOption.tags.allSelectTags.length > 0) {
                for (let i in this.selectOption.tags.allSelectTags) {
                    if (!tagsId[i]) {
                        tagsId[i] = null;
                    }
                }
            }
            for (let item in tagsId) {
                let objTitle = `tags[${item}]`;
                objTags[objTitle] = tagsId[item];

                allTags.push(objTitle);
                if (tagsId[item] != null) {
                    isEmpty = false;
                }
            }
            return [objTags, allTags, isEmpty];
        },
        /**
         * Поиск новостей с учтом фильтров
         *
         * @param {Boolean} isOnlyText - поиск только с фильтров search или нет
         *
         * @return undefined
         */
        setSearch: function (isOnlyText = false) {
            let data = this.createFiltersData(isOnlyText)[0];
            this.selectOption.tags.allSelectTags = this.createFiltersData(isOnlyText)[1];
            if (this.filtersValidation(isOnlyText)) {
                this.filtersState.setFilters = true;
                this.filtersState.filtersFound = true;

                this.getHints(false);
                this.getContent(data, false, isOnlyText);
                this.hintsFound = false;
                this.hints = [];
                if (isOnlyText == true) {
                    if (this.filters.errors.search <= 0) {
                        this.filtersState.isTextWithFiltersGet = false;
                    }
                }
            }
        },
        /**
         * Валидация фильтров
         *
         * @param {Boolean} isOnlyText - поиск только с фильтров search или нет
         *
         * @return {Boolean} -
         */
        filtersValidation: function (isOnlyText = false) {
            let result = false;
            this.filters.errors.dateFrom = !validationEqualLong(this.filters.date.dateFrom, 14);
            this.filters.errors.dateBy = !validationEqualLong(this.filters.date.dateBy, 14);
            this.filters.errors.search = !validationFieldLength(this.filters.search, 1, 64);
            this.filters.errors.dateFrom === false ? (result = true) : false;
            this.filters.errors.dateBy === false ? (result = true) : false;
            this.filters.errors.search === false ? (result = true) : false;

            this.createTagsParams()[2] == false ? (result = true) : false;
            if (isOnlyText === true) {
                result = true;
            }
            this.filters.onlyQuiz == true ? (result = true) : false;
            this.isInformationFeedLoad === true ? (result &= true) : (result = false);
            JSON.stringify(this.createFiltersData(isOnlyText)[0]) != JSON.stringify(this.filtersState.oldFilters)
                ? (result &= true)
                : (result = false);
            return !!result;
        },
        /**
         * Получение подсказок
         *
         * @param {Boolean} isGet - получат ли подсказки или cansel token
         *
         * @return undefined
         */
        getHints: async function (isGet = false) {
            let search = {
                text: this.filters.search,
            };
            if (isGet === false && this.sourceFind) {
                this.sourceFind.cancel();
            }
            this.sourceFind = axios.CancelToken.source();
            if (this.filters.search.length >= 3) {
                this.hintsFound = true;

                axios
                    .post(
                        "/inside/find",
                        {
                            search,
                        },
                        {
                            cancelToken: this.sourceFind.token,
                        },
                    )
                    .then((res) => {
                        if (res.data.res) {
                            this.createHints(res.data);
                            this.getHintsLoader = false;
                        } else {
                            if (!this.sourceFind) {
                                this.getHintsLoader = false;
                                this.elseError = true;
                                this.btnDesibled = false;
                            }
                        }
                    })
                    .catch((error) => {
                        if (!this.sourceFind) {
                            this.getHintsLoader = false;
                            this.elseError = true;
                            this.btnDesibled = false;
                        }
                    });
            }
        },
        /**
         * Вызов функции для получения подсказок
         *
         * @return undefined
         */
        initHintPrev: function () {
            if (event.key != "Enter") {
                this.getHints(false);
            }
        },
        /**
         * Инициализация подсказок
         *
         * @param {Object} data - контент get
         *
         * @return undefined
         */
        createHints: function (data) {
            let news = {};
            let quiz = {};
            let hints = new Array();
            if (data.news.length > 0) {
                data.news.forEach((el) => {
                    news = {
                        title: el.title,
                        id: el.id,
                    };
                    hints.push(news);
                });
            }
            if (data.quizzes.length > 0) {
                data.quizzes.forEach((el) => {
                    quiz = {
                        name: el.name,
                        id: el.id,
                    };
                    hints.push(quiz);
                });
            }
            hints = hints
                .sort(function (a, b) {
                    let c = new Date(a.created);
                    let d = new Date(b.created);
                    return c - d;
                })
                .slice(0, 10);
            if (this.filtersState.setFilters === false) {
                this.hints = hints;
            } else {
                this.hints = [];
            }
        },
        /**
         * Переключение видимости подсказок
         *
         * @return undefined
         */
        switchHintsVisibility: function () {
            if (this.filters.search.length >= 3 && this.hintsFound === true) {
                this.hintsVisible = !this.hintsVisible;
            }
        },
        /**
         * Открыть новость при клике на подсказку
         *
         * @param {Object} hint - подсказка
         *
         * @return undefined
         */
        openHint: function (hint) {
            this.resetFilters(true);
            let data = this.createFiltersData(false)[0];

            if (hint.title) {
                data = {
                    news_id: hint.id,
                    quiz_id: "",
                };
            } else if (hint.name) {
                data = {
                    quiz_id: hint.id,
                    news_id: "",
                };
            }
            this.filtersState.setFilters = true;
            this.filtersState.filtersFound = true;
            this.getContent(data);
            this.hintsVisible = false;
        },
        /**
         * Инициализация цветов для тегов
         *
         * @param {Object} news - контент
         *
         * @return undefined
         */
        initTagsColor: function (news) {
            let allTags = new Set();
            let firstNum = 0;
            let secondNum = 1;
            let thirdNum = 10;
            let fourthNum = 2;
            let fifthNum = 10;
            for (let item in news.news) {
                for (let tag in news.news[item].tags) {
                    allTags.add(news.news[item].tags[tag]);
                }
            }
            for (let item in news.quizes) {
                for (let tag in news.quizes[item].tags) {
                    allTags.add(news.quizes[item].tags[tag]);
                }
            }
            if (allTags.size > 0) {
                let res = Object.assign(
                    ...Array.from(allTags, (v) => ({
                        [v]: "",
                    })),
                );
                for (let tag in res) {
                    if (firstNum < 11) {
                        res[tag] = "background:" + this.brendbookColors[firstNum];
                        firstNum = firstNum + 1;
                    } else if (firstNum == 11 && secondNum <= 10) {
                        res[tag] = `background: linear-gradient(45deg,
                            ${this.brendbookColors[secondNum]},${this.brendbookColors[secondNum - 1]})`;
                        secondNum = secondNum + 1;
                    } else if (secondNum == 11 && thirdNum > 0) {
                        res[tag] = `background: linear-gradient(45deg,
                            ${this.brendbookColors[thirdNum - 1]},${this.brendbookColors[thirdNum]})`;
                        thirdNum = thirdNum - 1;
                    } else if (secondNum == 11 && thirdNum == 0 && fourthNum < 11) {
                        res[tag] = `background: linear-gradient(45deg,
                            ${this.brendbookColors[fourthNum - 2]},
                            ${this.brendbookColors[fourthNum - 1]},
                            ${this.brendbookColors[fourthNum]})`;
                        fourthNum = fourthNum + 1;
                    } else if (fourthNum == 11 && fifthNum > 1) {
                        res[tag] = `background: linear-gradient(45deg,
                            ${this.brendbookColors[fifthNum]},
                            ${this.brendbookColors[fifthNum - 1]},
                            ${this.brendbookColors[fifthNum - 2]})`;
                        fifthNum = fifthNum - 1;
                    }
                }
                this.tagsColors = res;
            }
        },
        /**
         * Пагинация для комментариев
         *
         * @param {Object} news - новость
         * @param {Object} event - событие новости
         *
         * @return undefined
         */
        getCommentPage: async function (news, event) {
            let commentData = {
                page: Number(news.pagination.currentPage),
                "per-page": Number(news.pagination.nextPage),
                news_id: Number(news.id),
            };
            this.btnDesibled = true;
            if (news.source) {
                news.source.cancel();
            }
            news.source = axios.CancelToken.source();
            await axios
                .post(
                    "/inside/get-comment-page",
                    {
                        commentData,
                    },
                    {
                        cancelToken: news.source.token,
                    },
                )
                .then((res) => {
                    if (res.data.res) {
                        news.commentsPaginate = {
                            ...res.data[0].pagination,
                        };
                        this.initPaginationComments(news);
                        news.userComments = res.data[0].comments;
                        news.numberComments = res.data[0].numberComments;
                        this.initComments(news, res.data[0].comments);
                        window.scrollBy({
                            left: this.offsetComment(event).left,
                            top: this.offsetComment(event).top,
                            behavior: "smooth",
                        });
                    } else {
                        if (!news.source) {
                            let error = {
                                request: {
                                    status: 422,
                                },
                            };
                            this.handlingError(
                                error,
                                "При пагинации комментариев произошла ошибка. Попробуйте повторить отправку позже.",
                                "Ошибка пагинации комментариев",
                            );
                        }
                    }
                    news.pagination.paginationLoad = false;
                    this.removeLoader();
                    this.btnDesibled = false;
                })
                .catch((error) => {
                    if (!news.source) {
                        this.handlingError(
                            error,
                            "При пагинации комментариев произошла ошибка. Попробуйте повторить отправку позже.",
                            "Ошибка пагинации комментариев",
                        );
                        news.pagination.paginationLoad = false;
                        this.removeLoader();
                    }
                });
        },
        /**
         * Валидация для кол-ва комментариев (1 комментарий, 2 комментария и т.д.)
         *
         * @param {Number} n - число комментариев
         * @param {Object} event - событие новости
         *
         * @return undefined
         */
        declOfNum: function (n, text_forms) {
            n = Math.abs(n) % 100;
            let n1 = n % 10;
            if (n > 10 && n < 20) {
                return text_forms[2];
            }
            if (n1 > 1 && n1 < 5) {
                return text_forms[1];
            }
            if (n1 == 1) {
                return text_forms[0];
            }
            return text_forms[2];
        },
        /**
         * Сброс фильтров
         *
         * @return undefined
         */
        resetFilters: function (isOpenHints = false) {
            this.filtersState.resetFiltersAll = true;
            this.filters.date.dateFrom = "";
            this.filters.date.dateBy = "";
            this.filters.onlyQuiz = false;
            this.filters.search = "";
            let data = this.createFiltersData()[0];
            this.filtersState.changeFilters = false;
            this.filtersState.activeResetFilters = false;
            if (isOpenHints === false) {
                this.activeLoader("filters");
            }
            this.filtersValidation();
            data.news_id = "";
            data.quiz_id = "";
            if (this.selectOption.tags.allSelectTags.length > 0) {
                let allresetTags = {};
                for (let item in this.selectOption.tags.allSelectTags) {
                    let title = this.selectOption.tags.allSelectTags[item];
                    allresetTags[title] = null;
                }
                data = Object.assign(data, allresetTags);
            }

            if (isOpenHints === false) {
                this.getContent(data);
            }
        },
        /**
         * Изменение рендера видео
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        changeVideoRender: function (news) {
            let content = news.content || news.text;
            while (content.includes("<oembed")) {
                news.readCompletely != undefined ? (news.readCompletely = true) : false;
                let oembedVal = content.slice(content.indexOf("<oembed"), content.indexOf("</oembed>") + 9);

                let link = oembedVal.slice(oembedVal.indexOf('url="') + 5);
                let lastLink = link.slice(0, link.indexOf('"'));
                let newLink = "";
                if (oembedVal.includes("www.youtube.com/watch?v=")) {
                    newLink = `<iframe src="${lastLink.replace(
                        "watch?v=",
                        "embed/",
                    )}" height="315" width="560"></iframe>`;
                } else {
                    newLink = `<video poster="/frontend/web/images/inside-project/video.png" height="315!important" width="auto!important" controls="controls"><source src="${lastLink.slice(
                        lastLink.indexOf("/frontend"),
                    )}"></video>`;
                }
                let newContent = content.replace(oembedVal, newLink);
                news.content ? (news.content = newContent) : (news.text = newContent);
                content = newContent;
            }
        },
        /**
         * Изменение работы ссылок в новости
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        changeHref: function (news) {
            let content = news.content || news.text;
            let newHref = content.replaceAll("<a", '<a target="_blank" ');
            news.content ? (news.content = newHref) : (news.text = newHref);
        },
        /**
         * Получение новых новостей
         *
         * @return undefined
         */
        getNewData: function () {
            let lastData = {};
            setInterval(() => {
                lastData = {
                    lastNewsDate: this.newInformationFeed.lastDate.lastNewsDate,
                    lastQuizDate: this.newInformationFeed.lastDate.lastQuizDate,
                };
                if (!this.newInformationFeed.lastDate.lastNewsDate) {
                    delete lastData.lastNewsDate;
                }
                if (!this.newInformationFeed.lastDate.lastQuizDate) {
                    delete lastData.lastQuizDate;
                }
                this.getNewInformation(lastData);
            }, this.newInformationFeed.timerNewInformation);
        },
        /**
         * Метод проверяет есть ли для пользователя новые новости
         *
         * @param {Object} lastData - даты последних новостей/опросов
         *
         * @return undefined
         */
        getNewInformation: async function (lastData) {
            await axios
                .post("/inside/get-new-data", {
                    lastData,
                })
                .then((res) => {
                    if (res.data.res) {
                        this.newInformationFeed.informationNumber.quizes = res.data.numberQuizzes;
                        this.newInformationFeed.informationNumber.news = res.data.numberNews;
                        clearInterval(this.windowFlashing);
                        this.windowFlashingFunc();
                    }
                })
                .catch((error) => {});
        },
        /**
         * Переключение title при новых новостях
         *
         * @return undefined
         */
        windowFlashingFunc: function () {
            if (
                this.newInformationFeed.informationNumber.quizes > 0 ||
                this.newInformationFeed.informationNumber.news > 0
            ) {
                if (document.visibilityState == "hidden") {
                    let msg = `Новый контент (${
                        this.newInformationFeed.informationNumber.quizes +
                        this.newInformationFeed.informationNumber.news
                    })`;
                    this.windowFlashing = setInterval(() => {
                        document.title = document.title == msg ? "Корпоративный Портал" : msg;
                    }, this.windowFlashingPeriod);
                }
                window.addEventListener("focus", (e) => {
                    clearInterval(this.windowFlashing);
                    document.title = "Корпоративный Портал";
                });
            }
        },
        /**
         * Метод вызывает функцию полумения новых новостей
         *
         * @return undefined
         */
        watchNewInformation: function () {
            this.isSliderNews = true;
            this.isSliderLoader = true;
            this.loaderSwitch();
            this.newInformationFeed.informationNumber.news = 0;
            this.newInformationFeed.informationNumber.quizes = 0;
            this.getContent(false, true);
            window.scrollBy({
                left: this.offsetInformationFeed(event).left,
                top: this.offsetInformationFeed(event).top,
                behavior: "smooth",
            });
        },
        /**
         * Высчитывание смещения экрана до информационной ленты
         *
         * @param {Object} event - событие
         *
         * @return {Object} - значения смещения
         */
        offsetInformationFeed: function (event) {
            let rect = event.target
                .closest("#portal")
                .getElementsByClassName("information-feed")[0]
                .getBoundingClientRect();
            return {
                top: rect.top - 20,
                left: rect.left,
            };
        },
        /**
         * Метод валидации input пагинации
         *
         * @param {Boolean} isBlur - в расфокусе ли input
         *
         * @return undefined
         */
        paginationInput: function (isBlur = false) {
            let value = String(this.pagination.nextInput);
            this.pagination.nextInput = value.replace(/[^0-9.]/g, "");
            this.pagination.nextInput = value.replace(/(\..*)\./g, "$1");
            value > this.pagination.allPage
                ? (this.pagination.nextInput = this.pagination.allPage)
                : (this.pagination.nextInput = value);
            if (isBlur == true) {
                this.pagination.nextPage = this.pagination.nextInput;
                this.pagination.isBlur = true;
            }
        },
        /**
         * Метод валидации input пагинации комментариев
         *
         * @param {Object} news - новость
         * @param {Boolean} isBlur - в расфокусе ли input
         *
         * @return undefined
         */
        newsPaginationInput: function (news, isBlur = false) {
            let value = String(news.pagination.nextInput);
            news.pagination.nextInput = value.replace(/[^0-9.]/g, "");
            news.pagination.nextInput = value.replace(/(\..*)\./g, "$1");
            value > news.pagination.allPage
                ? (news.pagination.nextInput = news.pagination.allPage)
                : (news.pagination.nextInput = value);
            if (isBlur == true) {
                news.pagination.nextPage = news.pagination.nextInput;
                this.getCommentPage(news, event);
                news.pagination.paginationLoad = true;
                this.paginationLoaderSwitch(news);
            }
        },
        /**
         * Лоадер для пагинаций
         *
         * @param {Object} news - новость
         *
         * @return undefined
         */
        paginationLoaderSwitch: function (news) {
            news !== null ? this.activeLoader(`сomments-pagination${news.id}`) : this.activeLoader("pagination");
        },
        /**
         * Метод для вывода ошибок
         *
         * @param {Object} error - ошибка запроса
         * @param {String} textError - текст ошибки
         * @param {String} titleError - заголовок ошибки
         *
         * @return undefined
         */
        handlingError: function (error, textError, titleError) {
            let thisVue = this;
            this.btnDesibled = false;
            let errMsg = "";
            if (error.request.status == 400) {
                errMsg = JSON.parse(error.request.responseText).err;
            }
            errosAll(error.request.status, thisVue, errMsg, textError, titleError);
        },
        /**
         * Сортировка тегов
         *
         * @param {Object} tags - теги
         *
         * @return {Object} - отсортированные теги
         */
        sortTags: function (tags) {
            let inputVal = this.selectOption.tags.inputVal.toLocaleLowerCase();
            if (inputVal.length !== 0) {
                return this.selectOption.tags.values
                    .filter((word) => word.name.toLocaleLowerCase().includes(inputVal))
                    .sort(
                        (prev, next) =>
                            Math.abs(prev.name.toLocaleLowerCase().indexOf(inputVal)) -
                            Math.abs(next.name.toLocaleLowerCase().indexOf(inputVal)),
                    );
            }
            return tags.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
        },
    },
});
