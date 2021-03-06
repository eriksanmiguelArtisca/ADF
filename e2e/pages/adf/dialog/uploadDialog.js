/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

var Util = require('../../../util/util');

var UploadDialog = function () {

    var closeButton = element.all((by.css("footer[class*='upload-dialog__actions'] button"))).first();
    var dialog = element.all(by.css("div[class*='upload-dialog']")).first();
    var minimizedDialog = element(by.css("div[class*='upload-dialog--minimized']"));
    var uploadedStatusIcon = by.css("mat-icon[class*='status--done']");
    var cancelledStatusIcon = by.css("div[class*='status--cancelled']");
    var cancelWhileUploadingIcon = by.css("mat-icon[class*='adf-file-uploading-row__action adf-file-uploading-row__action--cancel']");
    var rowByRowName = by.xpath("ancestor::adf-file-uploading-list-row");
    var title = element(by.css("span[class*='upload-dialog__title']"));
    var minimizeButton = element(by.css("mat-icon[title='Minimize']"));
    var maximizeButton = element(by.css("mat-icon[title='Maximize']"));
    var sizeUploaded = by.css("span[class='adf-file-uploading-row__status']");
    var canUploadConfirmationTitle = element(by.css("p[class='upload-dialog__confirmation--title']"));
    var canUploadConfirmationDescription = element(by.css("p[class='upload-dialog__confirmation--text']"));
    var confirmationDialogNoButton = element(by.partialButtonText("No"));
    var confirmationDialogYesButton = element(by.partialButtonText("Yes"));
    var cancelUploads = element(by.partialButtonText("Cancel uploads"));

    this.clickOnCloseButton = function () {
        this.checkCloseButtonIsDisplayed();
        closeButton.click();
        return this;
    };

    this.checkCloseButtonIsDisplayed = function() {
        Util.waitUntilElementIsVisible(closeButton);
        return this;
    };

    this.dialogIsDisplayed = function () {
        Util.waitUntilElementIsVisible(dialog);
        return this;
    };

    this.dialogIsMinimized = function () {
        Util.waitUntilElementIsVisible(minimizedDialog);
        return this;
    };

    this.dialogIsNotDisplayed = function () {
        Util.waitUntilElementIsNotOnPage(dialog);
        return this;
    };

    this.getRowsName = function (content) {
        var row = element.all(by.css("div[class*='uploading-row'] span[title='" + content +"']")).first();
        Util.waitUntilElementIsVisible(row);
        return row;
    };

    this.getRowByRowName = function (content) {
        return this.getRowsName(content).element(rowByRowName);
    };

    this.fileIsUploaded = function (content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(uploadedStatusIcon));
        return this;
    };

    this.filesAreUploaded = function (content) {
        for (i=0; i<content.length; i++) {
            this.fileIsUploaded(content[i]);
        }
        return this;
    };

    this.fileIsNotDisplayedInDialog = function (content) {
        Util.waitUntilElementIsNotVisible(element(by.css("div[class*='uploading-row'] span[title='" + content +"']")));
        return this;
    };

     this.cancelUploads = function (content) {
         Util.waitUntilElementIsVisible(cancelUploads);
         cancelUploads.click();
         return this;
     };

    this.fileIsCancelled = function (content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(cancelledStatusIcon));
        return this;
    };

    this.removeUploadedFile = function (content) {
        Util.waitUntilElementIsVisible(this.getRowByRowName(content).element(uploadedStatusIcon));
        this.getRowByRowName(content).element(uploadedStatusIcon).click();
        return this;
    };

    this.removeFileWhileUploading = function (content) {
        browser.driver.actions().mouseMove(this.getRowByRowName(content).element(sizeUploaded)).perform();
        this.getRowByRowName(content).element(cancelWhileUploadingIcon).click();
        return this;
    };

    this.getTitleText = function () {
        Util.waitUntilElementIsVisible(title);
        var deferred = protractor.promise.defer();
        title.getText().then( function (text) {
            deferred.fulfill(text);
        });
        return deferred.promise;
    };

    this.getConfirmationDialogTitleText = function () {
        Util.waitUntilElementIsVisible(canUploadConfirmationTitle);
        var deferred = protractor.promise.defer();
        canUploadConfirmationTitle.getText().then( function (text) {
            deferred.fulfill(text);
        });
        return deferred.promise;
    };

    this.getConfirmationDialogDescriptionText = function () {
        Util.waitUntilElementIsVisible(canUploadConfirmationDescription);
        var deferred = protractor.promise.defer();
        canUploadConfirmationDescription.getText().then( function (text) {
            deferred.fulfill(text);
        });
        return deferred.promise;
    };

    this.clickOnConfirmationDialogYesButton = function () {
        Util.waitUntilElementIsVisible(confirmationDialogYesButton);
        confirmationDialogYesButton.click();
        return this;
    };

    this.clickOnConfirmationDialogNoButton = function () {
        Util.waitUntilElementIsVisible(confirmationDialogNoButton);
        confirmationDialogNoButton.click();
        return this;
    };

    this.numberOfCurrentFilesUploaded = function () {
        var deferred = protractor.promise.defer();
        this.getTitleText().then(function (text) {
            deferred.fulfill(text.split('Uploaded ')[1].split(' / ')[0]);
        });
        return deferred.promise;
    };

    this.numberOfInitialFilesUploaded = function () {
        var deferred = protractor.promise.defer();
        this.getTitleText().then(function (text) {
            deferred.fulfill(text.split('Uploaded ')[1].split(' / ')[1]);
        });
        return deferred.promise;
    };

    this.minimizeUploadDialog = function () {
        Util.waitUntilElementIsVisible(minimizeButton);
        minimizeButton.click();
        return this;
    };

    this.maximizeUploadDialog = function () {
        Util.waitUntilElementIsVisible(maximizeButton);
        maximizeButton.click();
        return this;
    };

};
module.exports = UploadDialog;
