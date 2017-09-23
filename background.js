var app = angular.module('bgApp', ['ngMaterial']);
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
    $scope.bitCurrencyVal = '';
    $scope.currencyVal = '';
    $scope.valueOnButton = 'sell';
    $scope.buySellOptions = ["sell", "buy"];
    $scope.appSelectedcurrency = 'USD';
    $scope.appCurencies = [];
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
                    expanded: {}
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
                    expanded: {}
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
            console.log('doc ready');
            $('.progressCircle').hide();
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (typeof request.badgeTextsChanged !== 'undefined') {
                    sendResponse('from bg: received');
                    location.reload();
                }
            });
        });
    }]);
chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({ url: 'https://zupago.pe/account-selection' }, function (tab) {
        console.log('on installed launhc tab id: ' + tab.id);
    });
});
//# sourceMappingURL=background.js.map