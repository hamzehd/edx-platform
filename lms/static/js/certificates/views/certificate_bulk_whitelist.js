// Backbone Application View: CertificateBulkWhitelist View
/*global define, RequireJS */

;(function(define){
    'use strict';

    define([
            'jquery',
            'underscore',
            'gettext',
            'backbone'
        ],

        function($, _, gettext, Backbone){
            var DOM_SELECTORS = {
                bulk_exception: ".bulk-white-list-exception",
                upload_csv_button: ".upload-csv-button",
                browse_file: ".browse-file",
                bulk_white_list_exception_form: "form#bulk-white-list-exception-form"
            };

            return Backbone.View.extend({
                el: DOM_SELECTORS.bulk_exception,
                events: {
                    'change #browseBtn': 'chooseFile',
                    'click .upload-csv-button': 'uploadCSV'
                },

                initialize: function(options){
                    // Re-render the view when an item is added to the collection
                    this.bulk_exception_url = options.bulk_exception_url
                },

                render: function(){
                    var template = this.loadTemplate('certificate-bulk-white-list');
                    this.$el.html(template());
                },

                loadTemplate: function(name) {
                    var templateSelector = "#" + name + "-tpl",
                    templateText = $(templateSelector).text();
                    return _.template(templateText);
                },

                uploadCSV: function(event) {
                    var form = this.$el.find(DOM_SELECTORS.bulk_white_list_exception_form);
                    var self = this;
                    form.submit(function(event) {
                        event.preventDefault();
                        var data = new FormData(event.currentTarget);
                        data['csrfmiddlewaretoken'] = '{{ csrf_token }}';
                          $.ajax({
                            dataType: 'json',
                            type: 'POST',
                            url: self.bulk_exception_url,
                            data: data,
                            processData: false,
                            contentType: false,
                            success: function(data_from_server) {
                                self.display_response(data_from_server);
                            }
                          });
                    });
                },

                display_response: function(data_from_server) {
                    $(".results").empty();

                    // Display error messages
                    if (data_from_server.errors.length) {
                        var errors = data_from_server.errors;
                        for(var i = 0; i < errors.length; i++){
                            $(".results").append(generate_div('error', errors[i].response))
                        }
                    }

                    // Display warning messages
                    if (data_from_server.warnings.length) {
                        var warnings = data_from_server.warnings;
                        for(var i = 0; i < warnings.length; i++){
                            $(".results").append(generate_div('warning', warnings[i].response))
                        }
                    }

                    // Display a success message
                    if (data_from_server.success.length) {
                        var success = data_from_server.success;
                        for(var i = 0; i < success.length; i++){
                            $(".results").append(generate_div('success', success[i].response))
                        }
                    }

                    function generate_div(message_type, message) {
                        return $('<div/>', {
                            class: 'message message-' + message_type,
                            text: message
                        });
                    }
                },

                chooseFile: function(event) {
                    if (event && event.preventDefault) { event.preventDefault(); }
                    if (event.currentTarget.files.length == 1) {
                        this.$el.find(DOM_SELECTORS.upload_csv_button).removeClass('is-disabled');
                        this.$el.find(DOM_SELECTORS.browse_file).val(
                            event.currentTarget.value.substring(event.currentTarget.value.lastIndexOf("\\") + 1));
                    }
                },


                showSuccess: function(caller_object){
                    return function(xhr){
                        var response = xhr;
                    };
                },

                showError: function(caller_object){
                    return function(xhr){
                        var response = JSON.parse(xhr.responseText);
                    };
                }
            });
        }
    );
}).call(this, define || RequireJS.define);