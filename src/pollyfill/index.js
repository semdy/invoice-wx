Promise.prototype['finally'] = function (onResolveOrReject) {
  return this['catch'](function (result) {
    return result;
  }).then(onResolveOrReject);
};