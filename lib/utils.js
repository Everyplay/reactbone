"use strict";

exports.getErrorMessageFromXHR = function (xhr) {
  if (xhr.responseText !== undefined && xhr.responseText.length > 0) {
    var resp = xhr.responseText;
    try {
      var obj = JSON.parse(resp);
      if (obj.error) {
        resp = obj.error;
      }
    } catch (e) {
    }
    return resp;
  } else if (xhr.response !== undefined && xhr.response.length > 0) {
    return xhr.response;
  } else if (xhr.status > 0 && xhr.statusText !== undefined && xhr.statusText.length > 0) {
    return xhr.status + ': ' + xhr.statusText;
  } else {
    return 'Unknown error';
  }
};
