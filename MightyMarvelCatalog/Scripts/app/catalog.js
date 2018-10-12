define(['jquery', 'knockout', 'toastr', 'dataService'], function ($, ko, toastr, dataService) {
    "use strict";

    return function () {
        var catalog = {};

        var searchLimit = 10;

        var alphabetSearch = function () {
            catalog.searchCriteria(ko.dataFor(this));
            catalog.paging().Offset = 0;
            search();
        };

        var getFirstPage = function () {
            catalog.paging().Offset = 0;
            search();
        };

        var getLastPage = function () {
            if (catalog.paging().Offset + catalog.paging().Count < catalog.paging().Total)
            {
                catalog.paging().Offset = Math.floor(catalog.paging().Total / searchLimit) * searchLimit;
                search();
            }
        };

        var getNextPage = function () {
            if (catalog.paging().Offset + catalog.paging().Count < catalog.paging().Total)
            {
                catalog.paging().Offset = catalog.paging().Offset + catalog.paging().Count;
                search();
            }
        };

        var getPreviousPage = function () {
            if (catalog.paging().Offset > 0)
            {
                catalog.paging().Offset = catalog.paging().Offset - catalog.paging().Limit;
                search();
            }
        };

        var loadAlphabet = function () {
            var base = 65;

            for (var code = 0; code < 26; code++)
            {
                var letter = String.fromCharCode(base + code);
                catalog.alphabet().push(letter);
            };
        };

        var loadCharacters = function (result) {
            if (result.code == 200)
            {
                catalog.paging({
                    Count: result.data.count,
                    Offset: result.data.offset,
                    Total: result.data.total,
                    Limit: searchLimit
                });
                if (result.data.results.length > 0)
                {
                    catalog.characters(result.data.results);
                    toastr.success("Characters loaded");
                    setCharacter(catalog.characters()[0]);
                }
                else
                {
                    var message = "No results matching '" + catalog.searchCriteria() + "' were found.";
                    setCharacter(null);
                    catalog.characters([]);
                    toastr.error(message);
                }
            }
            else
            {
                toastr.error(result.status);
            }
        };

        var nameSearch = function () {
            catalog.paging().Offset = 0;
            search();
        };

        var search = function () {
            if (catalog.searchCriteria().length > 0)
            {
                var apiKey = "Your Marvel API Private Key goes here";
                var apiUrl = "http://gateway.marvel.com/v1/public/characters";
                var message = "Searching for characters starting with '" + catalog.searchCriteria() + "'";

                toastr.info(message);

                var requestData = {
                    nameStartsWith: catalog.searchCriteria,
                    limit: catalog.paging().Limit,
                    offset: catalog.paging().Offset,
                    apikey: apiKey
                };
                dataService.Get(apiUrl, requestData, loadCharacters);
            }
            else
            {
                toastr.error("Please enter search criteria");
            }
        };

        var selectCharacter = function () {
            var character = ko.dataFor(this);
            setCharacter(character);
        };

        var setCharacter = function (character) {
            if (character)
            {
                toastr.info("Selected: " + character.name);
                var description = character.description;
                description = description.trim();
                if (description.length == 0)
                {
                    description = "No description available.";
                }
                else
                {
                    // Some apostrophes come through encoded. Replace with plain '
                    description = description.replace(/ï¿½/gi, "'");
                    description = description.replace(/â€™/gi, "'");

                    // Some dashed come throgh encoded. Replace with plain -
                    description = description.replace(/â€“/gi, "-");
                }
                character.description = description;
            }
            catalog.selectedCharacter(character);
        };

        catalog.alphabet = ko.observableArray([]);

        catalog.characters = ko.observableArray([]);

        catalog.paging = ko.observable({
            Offset: 0,
            Limit: searchLimit,
            Total: 0,
            Count: 0
        });

        catalog.searchCriteria = ko.observable("");

        catalog.selectedCharacter = ko.observable(null);

        // Method to call which wires up events
        catalog.startUp = function () {
            // Fill the Alphabet array with letters
            loadAlphabet();

            $("input:text").focus(function () {
                // Any input[type=text] element on the page
                // that receives focus should select the text
                $(this).select();
            });

            $("#txtCharacterName").keyup(function (keyPress) {
                if (keyPress.keyCode == 13)
                    // if the "Enter" key is pressed on the #txtCharacterName
                    // input text box, execute the search by name
                    nameSearch();
            });

            // Click the Search button, search by name
            $("#btnSearchCharactersByName").click(nameSearch);

            // Click a letter button on the list, search by letter
            $("#lstLetters").on("click", ">li >button", alphabetSearch);

            // Click on a character in the search results, 
            // select the character for display
            $("#lstCharacterSearchResults").on("click", ">li", selectCharacter);

            // Navigate to the first page of results
            $("#btnGetFirstPage").click(getFirstPage);

            // Navigate to the previous page of results
            $("#btnGetPreviousPage").click(getPreviousPage);

            // Navigate to the next page of results
            $("#btnGetNextPage").click(getNextPage);

            // Navigate to the last page of results
            $("#btnGetLastPage").click(getLastPage);
        };

        return {
            Alphabet: catalog.alphabet,
            Characters: catalog.characters,
            Paging: catalog.paging,
            SearchCriteria: catalog.searchCriteria,
            SelectedCharacter: catalog.selectedCharacter,
            StartUp: catalog.startUp
        };
    };
});