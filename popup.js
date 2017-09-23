var app = angular.module('BitcoinRates', ['ngMaterial', 'chart.js']);
app.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $http) {
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.bitCurrencies = ["BCH", "BTC"];
    $scope.bitCurencySelectedValue = $scope.bitCurrencies[1];
    $scope.currencies = ['USD'];
    $scope.curencySelectedValue = $scope.currencies[0];
    $scope.httpData = null;
    $scope.httpDataBch = null;
    $scope.getCurrencyValues = tickerTimer();
    $scope.bitSelectChange = function () {
        $scope.currencyVal = '';
        $scope.bitCurrencyVal = '';
        console.log($scope.bitCurencySelectedValue);
    };
    $scope.curSelectChange = function () {
        $scope.currencyVal = '';
        $scope.bitCurrencyVal = '';
        console.log($scope.curencySelectedValue);
    };
    $scope.bitCurrencyVal = '';
    $scope.currencyVal = '';
    $scope.bitValChange = function () {
        var val = event.target.value;
        if (isNaN(val)) {
            $scope.bitCurrencyVal = '';
            $scope.currencyVal = 'Invalid number';
            return;
        }
        var current15m;
        if ($scope.bitCurencySelectedValue === 'BCH') {
            if ($scope.httpDataBch === null)
                return;
            current15m = $scope.httpDataBch[$scope.curencySelectedValue]['15m'];
        }
        else {
            if ($scope.httpData === null)
                return;
            current15m = $scope.httpData[$scope.curencySelectedValue]['15m'];
        }
        $scope.currencyVal = (val * current15m).toFixed(2);
    };
    $scope.curValChange = function () {
        var val = event.target.value;
        if (isNaN(val)) {
            $scope.currencyVal = '';
            $scope.bitCurrencyVal = 'Invalid number';
            return;
        }
        var current15m;
        if ($scope.bitCurencySelectedValue === 'BCH') {
            if ($scope.httpDataBch === null)
                return;
            current15m = $scope.httpDataBch[$scope.curencySelectedValue]['15m'];
        }
        else {
            if ($scope.httpData === null)
                return;
            current15m = $scope.httpData[$scope.curencySelectedValue]['15m'];
        }
        $scope.bitCurrencyVal = (val / current15m).toFixed(4);
    };
    $scope.valueOnButton = 'sell';
    $scope.buySellOptions = ["sell", "buy"];
    $scope.valueOnButtonChange = function () {
        setBadgeTexts();
        chrome.storage.sync.set({ valueOnButton: $scope.valueOnButton }, function () {
            chrome.runtime.sendMessage({ badgeTextsChanged: true }, function (response) {
                console.log(response);
            });
        });
    };
    $scope.appSelectedcurrency = 'USD';
    $scope.appCurencies = [];
    $scope.appSelectedcurrencyChange = function () {
        setBadgeTexts();
        chrome.storage.sync.set({ appSelectedcurrency: $scope.appSelectedcurrency }, function () {
            chrome.runtime.sendMessage({ badgeTextsChanged: true }, function (response) {
                console.log(response);
            });
        });
    };
    $scope.getchartdata = tickerWorks();
    //
    $scope.labels = [];
    $scope.data = [];
    $scope.series = ['USD/BTC'];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
        scales: {
            yAxes: [
                {
                    id: 'y-axis-1',
                    type: 'linear',
                    display: true,
                    position: 'left'
                }
            ]
        }
    };
    getChartData(function (data) {
        $scope.labels = data.labels;
        $scope.data = [data.data];
        $('.progressCircle').hide();
    });
    $scope.appSelectedBitCurency = 'BTC';
    $scope.appSelectedBitcurrencyChange = function () {
        setBadgeTexts();
        chrome.storage.sync.set({ appSelectedBitCurency: $scope.appSelectedBitCurency }, function () {
            chrome.runtime.sendMessage({ badgeTextsChanged: true }, function (response) {
                console.log(response);
            });
        });
    };
    $scope.httpBtcOrBch = null;
    function buildToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        };
    }
    function setBadgeTexts() {
        var appSelectedCurrency = $scope.appSelectedcurrency ? $scope.appSelectedcurrency : 'USD';
        var buyOrSellOnButton = $scope.valueOnButton ? $scope.valueOnButton : 'sell';
        $scope.appSelectedBitCurency === 'BTC' ? $scope.httpBtcOrBch = $scope.httpData : $scope.httpBtcOrBch = $scope.httpDataBch;
        $scope.httpBtcOrBch ? $scope.httpBtcOrBch = $scope.httpBtcOrBch : $scope.httpBtcOrBch = null;
        var text = '....', title = '...waiting...';
        if ($scope.httpBtcOrBch !== null) {
            text = ($scope.httpBtcOrBch[appSelectedCurrency][buyOrSellOnButton] / 1000).toFixed(1) + 'k';
            title = $scope.httpBtcOrBch[appSelectedCurrency][buyOrSellOnButton] + ' ' +
                appSelectedCurrency + ' (' + buyOrSellOnButton + ') -' + $scope.appSelectedBitCurency;
        }
        chrome.browserAction.setBadgeText({ text: text });
        chrome.browserAction.setTitle({
            title: title
        });
    }
    function tickerWorks() {
        getBTCDetails(function (data) {
            try {
                $scope.currencies = {
                    abbrev: Object.getOwnPropertyNames(data),
                    expanded: abbrevExpanded()
                };
                $scope.httpData = data;
                setBadgeTexts();
            }
            catch (e) {
                console.log(e.stack);
            }
        });
        getBCHDetails(function (data) {
            try {
                $scope.currencies = {
                    abbrev: Object.getOwnPropertyNames(data),
                    expanded: abbrevExpanded()
                };
                $scope.httpDataBch = data;
                setBadgeTexts();
            }
            catch (e) {
                console.log(e.stack);
            }
        });
        console.log($scope.valueOnButton);
    }
    function getBTCDetails(postHandler) {
        var url = 'https://zupago.pe/sock/BTC';
        $http({
            method: 'GET',
            url: url
        }).then(function succes(response) {
            postHandler(response.data);
        }, function err(response) {
            console.log(response.err);
        });
    }
    function getBCHDetails(postHandler) {
        var url = 'https://zupago.pe/sock/BCH';
        $http({
            method: 'GET',
            url: url
        }).then(function succes(response) {
            postHandler(response.data);
        }, function err(response) {
            console.log(response.err);
        });
    }
    function getChartData(postHandler) {
        var handledPostHanlder = false;
        chrome.storage.sync.get(function (data) {
            if (typeof data !== 'undefined' && typeof data.chartData !== 'undefined' && typeof data.chartData.storedDate !== 'undefined' &&
                new Date(data.chartData.storedDate).toLocaleDateString('en-us') === new Date().toLocaleDateString('en-us')) {
                postHandler(data.chartData.dataObject);
                handledPostHanlder = true;
            }
            else {
                var url = 'https://apiv2.bitcoinaverage.com/frontend/history/merged';
                $http({
                    method: 'GET',
                    url: url
                }).then(function succes(response) {
                    try {
                        var data_1 = response.data;
                        var chartDims_1 = {};
                        chartDims_1.labels = [];
                        chartDims_1.data = [];
                        data_1.data.forEach(function (item, index) {
                            var dt = item.time.substring(0, item.time.indexOf(' '));
                            if (chartDims_1.labels.indexOf(dt) < 0) {
                                chartDims_1.labels.unshift(dt);
                                chartDims_1.data.unshift(item.usd);
                            }
                        });
                        chartDims_1.labels = chartDims_1.labels.splice(0, 90);
                        chartDims_1.data = chartDims_1.data.splice(0, 90);
                        chartDims_1.labels = chartDims_1.labels.reverse();
                        chartDims_1.data = chartDims_1.data.reverse();
                        if (!handledPostHanlder)
                            postHandler(chartDims_1);
                        chrome.storage.sync.set({
                            chartData: {
                                'storedDate': new Date().getTime(),
                                'dataObject': chartDims_1
                            }
                        });
                    }
                    catch (e) {
                        console.log(e.stack);
                    }
                }, function err(response) {
                    console.log(response.err);
                });
            }
        });
    }
    function abbrevExpanded() {
        return {
            'AED': 'United Arab Emirates dirham',
            'AFN': 'Afghan afghani',
            'ALL': 'Albanian lek',
            'AMD': 'Armenian dram',
            'ANG': 'Netherlands Antillean guilder',
            'AOA': 'Angolan kwanza',
            'ARS': 'Argentine peso',
            'AUD': 'Australian dollar',
            'AWG': 'Aruban florin',
            'AZN': 'Azerbaijani manat',
            'BAM': 'Bosnia and Herzegovina convertible mark',
            'BBD': 'Barbados dollar',
            'BDT': 'Bangladeshi taka',
            'BGN': 'Bulgarian lev',
            'BHD': 'Bahraini dinar',
            'BIF': 'Burundian franc',
            'BMD': 'Bermudian dollar',
            'BND': 'Brunei dollar',
            'BOB': 'Boliviano',
            'BRL': 'Brazilian real',
            'BSD': 'Bahamian dollar',
            'BTN': 'Bhutanese ngultrum',
            'BWP': 'Botswana pula',
            'BYN': 'New Belarusian ruble',
            'BYR': 'Belarusian ruble',
            'BZD': 'Belize dollar',
            'CAD': 'Canadian dollar',
            'CDF': 'Congolese franc',
            'CHF': 'Swiss franc',
            'CLF': 'Unidad de Fomento',
            'CLP': 'Chilean peso',
            'CNY': 'Renminbi|Chinese yuan',
            'COP': 'Colombian peso',
            'CRC': 'Costa Rican colon',
            'CUC': 'Cuban convertible peso',
            'CUP': 'Cuban peso',
            'CVE': 'Cape Verde escudo',
            'CZK': 'Czech koruna',
            'DJF': 'Djiboutian franc',
            'DKK': 'Danish krone',
            'DOP': 'Dominican peso',
            'DZD': 'Algerian dinar',
            'EGP': 'Egyptian pound',
            'ERN': 'Eritrean nakfa',
            'ETB': 'Ethiopian birr',
            'EUR': 'Euro',
            'FJD': 'Fiji dollar',
            'FKP': 'Falkland Islands pound',
            'GBP': 'Pound sterling',
            'GEL': 'Georgian lari',
            'GHS': 'Ghanaian cedi',
            'GIP': 'Gibraltar pound',
            'GMD': 'Gambian dalasi',
            'GNF': 'Guinean franc',
            'GTQ': 'Guatemalan quetzal',
            'GYD': 'Guyanese dollar',
            'HKD': 'Hong Kong dollar',
            'HNL': 'Honduran lempira',
            'HRK': 'Croatian kuna',
            'HTG': 'Haitian gourde',
            'HUF': 'Hungarian forint',
            'IDR': 'Indonesian rupiah',
            'ILS': 'Israeli new shekel',
            'INR': 'Indian rupee',
            'IQD': 'Iraqi dinar',
            'IRR': 'Iranian rial',
            'ISK': 'Icelandic króna',
            'JMD': 'Jamaican dollar',
            'JOD': 'Jordanian dinar',
            'JPY': 'Japanese yen',
            'KES': 'Kenyan shilling',
            'KGS': 'Kyrgyzstani som',
            'KHR': 'Cambodian riel',
            'KMF': 'Comoro franc',
            'KPW': 'North Korean won',
            'KRW': 'South Korean won',
            'KWD': 'Kuwaiti dinar',
            'KYD': 'Cayman Islands dollar',
            'KZT': 'Kazakhstani tenge',
            'LAK': 'Lao kip',
            'LBP': 'Lebanese pound',
            'LKR': 'Sri Lankan rupee',
            'LRD': 'Liberian dollar',
            'LSL': 'Lesotho loti',
            'LYD': 'Libyan dinar',
            'MAD': 'Moroccan dirham',
            'MDL': 'Moldovan leu',
            'MGA': 'Malagasy ariary',
            'MKD': 'Macedonian denar',
            'MMK': 'Myanmar kyat',
            'MNT': 'Mongolian togrog',
            'MOP': 'Macanese pataca',
            'MRO': 'Mauritanian ouguiya',
            'MUR': 'Mauritian rupee',
            'MVR': 'Maldivian rufiyaa',
            'MWK': 'Malawian kwacha',
            'MXN': 'Mexican peso',
            'MXV': 'Mexican Unidad de Inversion',
            'MYR': 'Malaysian ringgit',
            'MZN': 'Mozambican metical',
            'NAD': 'Namibian dollar',
            'NGN': 'Nigerian naira',
            'NIO': 'Nicaraguan cordoba',
            'NOK': 'Norwegian krone',
            'NPR': 'Nepalese rupee',
            'NZD': 'New Zealand dollar',
            'OMR': 'Omani rial',
            'PAB': 'Panamanian balboa',
            'PEN': 'Peruvian Sol',
            'PGK': 'Papua New Guinean kina',
            'PHP': 'Philippine peso',
            'PKR': 'Pakistani rupee',
            'PLN': 'Polish złoty',
            'PYG': 'Paraguayan guaraní',
            'QAR': 'Qatari riyal',
            'RON': 'Romanian leu',
            'RSD': 'Serbian dinar',
            'RUB': 'Russian ruble',
            'RWF': 'Rwandan franc',
            'SAR': 'Saudi riyal',
            'SBD': 'Solomon Islands dollar',
            'SCR': 'Seychelles rupee',
            'SDG': 'Sudanese pound',
            'SEK': 'Swedish krona',
            'SGD': 'Singapore dollar',
            'SHP': 'Saint Helena pound',
            'SLL': 'Sierra Leonean leone',
            'SOS': 'Somali shilling',
            'SRD': 'Surinamese dollar',
            'SSP': 'South Sudanese pound',
            'STD': 'Sao Tome and Principe dobra',
            'SVC': 'Salvadoran colon',
            'SYP': 'Syrian pound',
            'SZL': 'Swazi lilangeni',
            'THB': 'Thai baht',
            'TJS': 'Tajikistani somoni',
            'TMT': 'Turkmenistani manat',
            'TND': 'Tunisian dinar',
            'TOP': 'Tongan paanga',
            'TRY': 'Turkish lira',
            'TTD': 'Trinidad and Tobago dollar',
            'TWD': 'New Taiwan dollar',
            'TZS': 'Tanzanian shilling',
            'UAH': 'Ukrainian hryvnia',
            'UGX': 'Ugandan shilling',
            'USD': 'United States dollar',
            'UYI': 'Uruguay Peso en Unidades Indexadas',
            'UYU': 'Uruguayan peso',
            'UZS': 'Uzbekistan som',
            'VEF': 'Venezuelan bolívar',
            'VND': 'Vietnamese dong',
            'VUV': 'Vanuatu vatu',
            'WST': 'Samoan tala',
            'XAF': 'Central African CFA franc',
            'XCD': 'East Caribbean dollar',
            'XOF': 'West African CFA franc',
            'XPF': 'CFP franc',
            'XXX': 'No currency',
            'YER': 'Yemeni rial',
            'ZAR': 'South African rand',
            'ZMW': 'Zambian kwacha',
            'ZWL': 'Zimbabwean dollar'
        };
    }
    function tickerTimer() {
        try {
            chrome.storage.sync.get(function (data) {
                try {
                    if (typeof data.appSelectedcurrency !== 'undefined' || data.appSelectedcurrency !== null)
                        $scope.appSelectedcurrency = data.appSelectedcurrency ? data.appSelectedcurrency : 'USD';
                }
                catch (e) {
                    console.log(e.stack);
                }
                try {
                    if (typeof data.valueOnButton !== 'undefined' || data.valueOnButton !== null)
                        $scope.valueOnButton = data.valueOnButton ? data.valueOnButton : 'sell';
                }
                catch (e) {
                    console.log(e.stack);
                }
                if (typeof data.appSelectedBitCurency !== 'undefined' && data.appSelectedBitCurency !== null)
                    $scope.appSelectedBitCurency = data.appSelectedBitCurency ? data.appSelectedBitCurency : 'BTC';
                $scope.appSelectedBitCurency === 'BTC' ? $scope.httpBtcOrBch = $scope.httpData : $scope.httpBtcOrBch = $scope.httpDataBch;
            });
            $('footer a').click(function (event) {
                chrome.tabs.create({ url: event.target.href });
            });
            setTimeout(function () {
                var _gaq = _gaq || [];
                _gaq.push(['_setAccount', 'UA-86277103-1']);
                _gaq.push(['_trackPageview']);
                (function () {
                    var ga = document.createElement('script');
                    ga.type = 'text/javascript';
                    ga.async = true;
                    ga.src = 'https://ssl.google-analytics.com/ga.js';
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(ga, s);
                })();
            }, 100);
        }
        catch (e) {
            console.log(e.stack);
        }
        tickerWorks();
        setInterval(function () {
            tickerWorks();
        }, 6000);
    }
});
app.controller('DocLoaded', [function ($scope) {
        angular.element(document).ready(function () {
            console.log('doc loaded');
            $('.loadingLines').hide();
        });
    }]);
//# sourceMappingURL=popup.js.map