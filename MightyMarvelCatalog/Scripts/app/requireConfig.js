requirejs.config({
    baseUrl: "/Scripts",
    paths: {
        jquery: "vendor/jquery-3.1.1.min",
        knockout: "vendor/knockout-3.4.2",
        toastr: 'vendor/toastr',
        dataService: "app/dataService",
        catalog: "app/catalog"
    }
});

requirejs(['app/main']);
