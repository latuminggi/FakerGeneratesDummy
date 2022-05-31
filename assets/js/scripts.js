//github.com/faker-js/faker
import { faker } from '//cdn.jsdelivr.net/npm/@faker-js/faker/+esm';

let fgdVersion = '0.1';
let fgdGitUrl = 'https://github.com/latuminggi/FakerGeneratesDummy';
let fgdPageUrl = 'https://latuminggi.github.io/FakerGeneratesDummy';
let fgdApiHost = ( window.location.host === 'latuminggi.github.io' ) ? 
                 'latuminggi.infinityfreeapp.com' : window.location.host;
let fgdApiUrl = '//'+ fgdApiHost +'/FakerGeneratesDummy/api'; console.log('fgdApiUrl', fgdApiUrl)
let fakerLogoUrl = 'https://fakerjs.dev/logo.svg';
let dataGenerator = $('#dataGenerator');
let dataColumns = $('#dataColumns');
let colTypeHint = 'Select dummy data type';
let windowWidth = $(window).width();
let maxMobileWidth = 575;

$('body').css('word-break', 'break-word');
$('[property="og:title"]').attr( 'content', $('title').text() );
$('[property="og:type"]').attr( 'content', 'website' );
$('[property="og:url"]').attr( 'content', fgdPageUrl );
$('[property="og:image"]').attr( 'content', fakerLogoUrl );
$('#title').html( 
    $('title').text() +' <small>v'+ fgdVersion +'</small> <span class="link-git">' +
    '<a href="'+ fgdGitUrl +'"><i class="fa fa-github text-light" aria-hidden="true"></i></a></span>'
);
dataGenerator.attr('action', fgdApiUrl); addDataCol();

function addDataCol() {
    $.ajax({ url: 'assets/html/column.html', })
    .done(function(html) {
        dataColumns.append( html );
        var columnAttr = dataColumns.find('.column-attribute');
            
        $.each(columnAttr, function(col, attr) {
            var colIdx = col + 1;
            $(attr).find('.column-label').text('Column '+ colIdx);
            $(attr).find('.column-name').attr('name', 'col['+ colIdx +'][name]');
            $(attr).find('.column-type').attr('name', 'col['+ colIdx +'][type]');
            $(attr).find('.column-custom').attr('name', 'col['+ colIdx +'][custom]');
            $(attr).find('.column-name').attr('placeholder', 
                $(attr).find('.column-label').text() +' name (e.g. '+ faker.database.column() +')'
            );
            $(attr).find('.column-type-error').find('label')
                .attr('id', 'col['+ colIdx +'][type]-error')
                .attr('for', 'col['+ colIdx +'][type]');
        });

        $.ajax({ url: 'assets/json/columnTypes.json', })
        .done(function(data) {
            $.each(data, function(mod, sub) {
                var columnTypes = '';
                $.each(sub, function(val, el) {
                    var fn = new Function('return '+ el.api)();
                    columnTypes += '<option value="'+ val +'">'+ el.name +' (e.g. '+ fn(faker) +')</option>';
                })

                dataColumns.find('.column-type')
                    .append('<optgroup label="'+ mod +'">'+ columnTypes +'</optgroup>');
            });

            $(document).ready(function() {
                var tableName = 'User'+ ucfirst( faker.database.column() );
                $('body').find('.col-table-name input').attr( 'placeholder', 
                    'Table name (e.g. '+ tableName +')' 
                )

                

                $('.column-name').on('change keyup', function(e) {
                    if ( $(this).val() !== '' ) { $(this).attr('data-inputbyhuman', true); } 
                    else { $(this).attr('data-inputbyhuman', false); }
                });

                $('.column-type').select2({
                    theme: 'bootstrap4',
                    placeholder: colTypeHint
                });

                $('.column-type').on('change', function(e) {
                    var colAttr = this.closest('.column-attribute');
                    var colName = $(colAttr).find('.column-name');
                    var colNameBy = colName.attr('data-inputbyhuman');
                    var colCustomField = $(colAttr).find('.column-custom-field');
                    var colCustom = $(colAttr).find('.column-custom');

                    if ( colName.val() === '' || colNameBy === 'false' ) { colName.val( $(this).val() ); }

                    if ( $(this).val() === 'StaticConstant' ) {
                        colCustomField.removeClass('hidden');
                        colCustom.attr('placeholder', 'Your static constant')
                            .attr('data-original-title', 'Blank is allowed and will return an empty string');
                    } else {
                        colCustomField.addClass('hidden');
                    }
                });

                $('.btn-del-col').on('click', function() { delDataCol(this); });
                $('[data-toggle="tooltip"]').tooltip();

                jQuery.validator.addClassRules('column-name', {
                    required: true, alphanumeric: true
                });

                dataGenerator.validate({ rules: { 'tableName': { alphanumeric: true } } });
            });
        });
    });
}

function delDataCol(el) {
    $(el).closest('.column-attribute').remove();
    var columnAttr = dataColumns.find('.column-attribute');
            
    $.each(columnAttr, function(col, attr) {
        var colIdx = col + 1;
        $(attr).find('.column-label').text('Column '+ colIdx);
        $(attr).find('.column-name').attr('name', 'col['+ colIdx +'][name]');
        $(attr).find('.column-type').attr('name', 'col['+ colIdx +'][type]');
        $(attr).find('.column-name').attr('placeholder', $(attr).find('.column-label').text() +' name');
    });
}

$('[name="dataType"]').on('change', function() {
    if ( $(this).val() === 'sql' ) {
        $('.col-table-name').removeClass('hidden');
        $('.col-table-name').find('input').removeAttr('disabled');
    } else {
        $('.col-table-name').addClass('hidden');
        $('.col-table-name').find('input').attr('disabled', 'disabled');
    }
});

$('#btn-add-col').on('click', function() { addDataCol(); });

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
    $('body').find('.select2-container--bootstrap4').addClass('text-dark');

    var colTypeWidth = $('.column-type-field').find('.select2-container[data-select2-id]').width();
    if ( windowWidth <= maxMobileWidth ) {
        $('[name="totalData"], [name="dataType"], [name="tableName"], .column-name')
            .css( 'width', colTypeWidth ).css('margin', '0 auto');
    }
});

observer.observe(document, {
    subtree: true,
    attributes: true
});