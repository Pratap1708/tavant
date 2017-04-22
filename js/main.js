window.LA = window.LA || {};
"use strict";
LA.Controller = (function (context) {
    var leavesData = [],
        daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        $el = {};

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


    _initDOMCaching = function() {
        $el.leaveForm = $('.leave-form');
        $el.leaveBucketForm = $('.leave-bucket-form');
        $el.leaveTable = $('.leave-table');
        $el.showEntries = $('#showEntries');
        $el.searchEntries = $('#search');
    }

    _initDOMEvents = function() {
        $el.leaveForm.off('submit.leaveForm').on('submit.leaveForm', _submitLeaveForm);
        $el.leaveBucketForm.off('submit.leaveBucketForm').on('submit.leaveBucketForm', _submitleaveBucketForm);
        $el.showEntries.off('change').on('change', _showEntries);
        $el.leaveTable.off('click.cancelLeave').on('click.cancelLeave', '.tavant-delete', _cancelLeave);
        $el.leaveTable.off('change.checkHalfDay').on('change.checkHalfDay', '.halfday', _checkHalfDay);
        $el.leaveTable.off('change.changeLeaveType').on('change.changeLeaveType', 'select.leave-type', _changeLeaveType);
        $el.searchEntries.off('keyup').on('keyup', _searchEntries);
    }

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
            alert('End date should be greater than start date');
            return;
        }

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
        _renderLeaveBucket(leavesData);
    }

    _enableSubmit = function(event) {
    	if ($('.leave-table tbody tr').length > 0) {
    		$el.leaveBucketForm.find('.btn-primary').removeClass('disabled');
    	} else {
    		$el.leaveBucketForm.find('.btn-primary').addClass('disabled');
    	}
    }

    _submitleaveBucketForm = function(event) {
    	if ($(this).find('.btn-primary').hasClass('disabled')) {
    		return;
    	}
        event.preventDefault();
        $.ajax({
            type: 'POST',
            data: {data: leavesData},
            url: "/someURL",
            success: function(result) {
                console.info('Leave Application submitted successfully!');
            },
            error: function() {
                console.info('Something went wrong!');
            }
        })
    }

    _getNoOfDays = function(startDate, endDate) {
        return ((endDate - startDate) / (1000 * 60 * 60 * 24));
    }

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
        _enableSubmit();
    }

    _showEntries = function (event) {
        var value = parseInt($(this).val());
        if (isNaN(value)) {
            _renderLeaveBucket(leavesData);
        } else {
            _renderLeaveBucket(leavesData, value);
        }
    }

    _cancelLeave = function(event) {
        var $this = $(this),
            index;
        event.preventDefault();
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData.splice(index, 1);
        $el.showEntries.trigger('change');
    }

    _searchEntries = function() {
        var value = $(this).val().toLowerCase(),
            data,
            regexp = new RegExp(value, 'g');
        data = leavesData.filter(function(obj) {
            return regexp.test(obj.day.toLowerCase())
        });
        $el.showEntries.val('');
        _renderLeaveBucket(data);
    }

    _checkHalfDay = function() {
        var $this = $(this),
            index;
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData[index].halfDay = $this.prop('checked');
    }

    _changeLeaveType = function() {
        var $this = $(this),
            index;
        index = $el.leaveTable.find('tbody tr').index($this.closest('tr'));
        leavesData[index].leaveType = $this.val();
    }

    context.init = function() {
        _initDOMCaching();
        _initDOMEvents();
        _enableSubmit();
    }

    return context;
})({});

LA.Controller.init();
