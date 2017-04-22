/*
 * @project:    Leave Application
 * @date:       2017-04-20
 * @author:     Saurabh
 * @namespaces: LA
 */


window.LA = window.LA || {};
"use strict";
LA.Controller = (function (context) {
    
	/**
	Variables
	*/
    var leavesData = [],
        daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        $el = {};

	/**
	 Methods
	 */
    var _initDOMCaching,
     	_initDOMEvents,
     	_submitLeaveForm,
     	_enableSubmit,
     	_submitleaveBucketForm,
     	_getNoOfDays,
     	_renderLeaveBucket,
     	_showEntries,
     	_cancelLeave,
     	_searchEntries,
     	_checkHalfDay,
     	_changeLeaveType;

    /**
     * @method _initDOMCaching
     * @description DOM Caching in Variables
     * @memberof LA.Controller
     */
    _initDOMCaching = function() {
        $el.leaveForm = $('.leave-form');
        $el.leaveBucketForm = $('.leave-bucket-form');
        $el.leaveTable = $('.leave-table');
        $el.showEntries = $('#showEntries');
        $el.searchEntries = $('#search');
        $el.succesMsg = $el.leaveBucketForm.find('.success-msg');
        $el.leaveTableBody= $el.leaveTable.find('tbody');
    }

    /**
     * @method _initDOMEvents
     * @description Event Binding
     * @memberof LA.Controller
     */
    _initDOMEvents = function() {
        $el.leaveForm.off('submit.leaveForm').on('submit.leaveForm', _submitLeaveForm);
        $el.leaveBucketForm.off('submit.leaveBucketForm').on('submit.leaveBucketForm', _submitleaveBucketForm);
        $el.showEntries.off('change').on('change', _showEntries);
        $el.leaveTable.off('click.cancelLeave').on('click.cancelLeave', '.tavant-delete', _cancelLeave);
        $el.leaveTable.off('change.checkHalfDay').on('change.checkHalfDay', '.halfday', _checkHalfDay);
        $el.leaveTable.off('change.changeLeaveType').on('change.changeLeaveType', 'select.leave-type', _changeLeaveType);
        $el.searchEntries.off('keyup').on('keyup', _searchEntries);
    }

    /**
     * @method _submitLeaveForm
     * @description Submit Leave form 
     * @memberof LA.Controller
     */
    _submitLeaveForm = function(event) {
        event.preventDefault();
        var startDate = $el.leaveForm.find('#startDate').val(),
            endDate = $el.leaveForm.find('#endDate').val(),
            noOfDays,
            currentDate;
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        noOfDays = _getNoOfDays(startDate, endDate);
        if (noOfDays < 0) {
            $el.leaveForm.find('.date-error').text('End date should be greater than start date');
            return;
        }
        $el.leaveForm.find('.date-error').text('');
        for (var i = 0; i <= noOfDays; i++) {
            currentDate = new Date();
            currentDate.setDate(startDate.getDate() + i);
            leavesData.push({
                leaveType: $el.leaveForm.find('#leaveType').val(),
                date: currentDate.toLocaleDateString(),
                day: daysArray[currentDate.getDay()],
                reason: $el.leaveForm.find('#reason').val(),
                contact: $el.leaveForm.find('#contact').val(),
                halfDay: false

            });
        }
        $el.leaveForm[0].reset();
        _renderLeaveBucket(leavesData);
    }

    /**
     * @method _enableSubmit
     * @description Check when Submit Button need to be enabled
     * @memberof LA.Controller
     */
    _enableSubmit = function(event) {
    	if ($('.leave-table tbody tr').length > 0) {
    		$el.leaveBucketForm.find('.btn-primary').removeClass('disabled');
    	} else {
    		$el.leaveBucketForm.find('.btn-primary').addClass('disabled');
    	}
    }

    /**
     * @method _submitleaveBucketForm
     * @description Final Ajax Call to submit Leave Bucket Form
     * @memberof LA.Controller
     */
    _submitleaveBucketForm = function(event) {
    	if ($(this).find('.btn-primary').hasClass('disabled')) {
    		return;
    	}
        //var ajaxUrl = $el.leaveBucketForm[0].getAttribute('data-ajax-url');
        event.preventDefault();
        $.ajax({
            type: 'GET',
            data: {data: leavesData},
            url: "http://localhost:3000/data/leaveSubmit.json",
            success: function(result) {
                $el.leaveTableBody.html('');
                $el.succesMsg.text(result.message);
                console.info('Leave Application submitted successfully!');

            },
            error: function() {
                console.info('Something went wrong!');
            }
        })
    }

    /**
     * @method _getNoOfDays
     * @description Calculation of days based on the Start and End Date of Leave
     * @memberof LA.Controller
     */
    _getNoOfDays = function(startDate, endDate) {
        return ((endDate - startDate) / (1000 * 60 * 60 * 24));
    }

    /**
     * @method _renderLeaveBucket
     * @description Leave Bucket Rendering on submission of apply leave form
     * @memberof LA.Controller
     */
    _renderLeaveBucket = function(data, howMany) {
        var tableString = '<tr><td>{date}</td><td>{day}</td><td class="text-center"><input type="checkbox" class="halfday" name="halfday"></td><td><select class="leave-type" id="leaveType" name="leaveType"><option selected="selected">PL</option><option>CL</option><option>SL</option></select></td><td class="text-center"><a href="#" class="tavant-icon tavant-delete"></a></td></tr>',
            temp;
        data = howMany ? data.slice(0, howMany) : data;
        $el.leaveTable.find('tbody').empty();
        data.forEach(function(obj, idx) {
            temp = tableString.replace(/{date}/g, obj.date);
            temp = temp.replace(/{day}/g, obj.day);
            $el.leaveTable.find('tbody').append(temp);
            $el.leaveTable.find('tbody tr').last().find('select').val(obj.leaveType);
        });
        $el.succesMsg.text('');
        _enableSubmit();
    }

    /**
     * @method _showEntries
     * @description Shows the number of entries to be displayed on page
     * @memberof LA.Controller
     */
    _showEntries = function (event) {
        var value = parseInt($(this).val());
        if (isNaN(value)) {
            _renderLeaveBucket(leavesData);
        } else {
            _renderLeaveBucket(leavesData, value);
        }
    }

    /**
     * @method _cancelLeave
     * @description Delete a specific day's leave
     * @memberof LA.Controller
     */
    _cancelLeave = function(event) {
        var $this = $(this),
            index;
        event.preventDefault();
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData.splice(index, 1);
        $el.showEntries.trigger('change');
    }

    /**
     * @method _searchEntries
     * @description Seach on the basis of Day's Name
     * @memberof LA.Controller
     */
    _searchEntries = function() {
        var value = $(this).val().toLowerCase(),
            data,
            regexp = new RegExp(value, 'g');
        	data = leavesData.filter(function(obj) {
            	return regexp.test(obj.day.toLowerCase());
        	});
        $el.showEntries.val('');
        _renderLeaveBucket(data);
    }

    /**
     * @method _checkHalfDay
     * @description Check any given day leave is half day or full
     * @memberof LA.Controller
     */
    _checkHalfDay = function() {
        var $this = $(this),
            index;
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData[index].halfDay = $this.prop('checked');
    }

    /**
     * @method _changeLeaveType
     * @description Leave Type change capturing in Leave Bucket
     * @memberof LA.Controller
     */
    _changeLeaveType = function() {
        var $this = $(this),
            index;
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData[index].leaveType = $this.val();
    }

    /**
     * @method context.init
     * @description Initializes on Page Load and binds the necessary methods
     * @memberof LA.Controller
     */
    context.init = function() {
        _initDOMCaching();
        _initDOMEvents();
        _enableSubmit();
    }

    // Public API
    return context;
})({});

LA.Controller.init();
