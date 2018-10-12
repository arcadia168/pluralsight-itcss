define(['jquery', 'toastr'], function ($, toastr) {
    "use strict";

    var service = {};
        
    service.get = function (url, data, successFunction) {
        $.ajax({ url: url, data: data, dataType: "json" })
             .done(function (result) {
                 successFunction(result);
             })
            .fail(function () {
                toastr.error("Error retrieving data.");
            });
    };

    service.send = function (url, data, successFunction) {
        $.ajax({ url: url, cache: false, data: data })
            .done(function (result) {
                successFunction(result);
            })
            .fail(function () {
                toastr.error("Error sending data.");
            });
        return false;
    };

    return {
        Get: service.get,
        Send: service.send
    };
});
