'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _staticMapProviders = require('./staticMapProviders.js');

var _staticMapProviders2 = _interopRequireDefault(_staticMapProviders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var containerStyle = {
    display: 'block',
    position: 'relative'
};

var paneStyle = {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundSize: '100%'
};

var StaticMapZoom = function (_React$Component) {
    _inherits(StaticMapZoom, _React$Component);

    function StaticMapZoom(props) {
        _classCallCheck(this, StaticMapZoom);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StaticMapZoom).call(this, props));

        _this.state = {
            visiblePane: 0
        };
        return _this;
    }

    _createClass(StaticMapZoom, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.installMouseBehavior();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'buildImageUrls',
        value: function buildImageUrls() {
            var _this2 = this;

            return this.props.zooms.map(function (zoom) {
                var opts = {
                    zoom: zoom,
                    width: _this2.props.width,
                    height: _this2.props.height,
                    lat: _this2.props.center.lat,
                    lng: _this2.props.center.lng,
                    apiKey: _this2.props.apiKey
                };
                return _staticMapProviders2.default[_this2.props.provider](opts);
            });
        }
    }, {
        key: 'installMouseBehavior',
        value: function installMouseBehavior() {
            var _this3 = this;

            var _props = this.props;
            var height = _props.height;
            var width = _props.width;
            var zooms = _props.zooms;

            // computes coordinates of zones reacting to mouse events (i.e. the "pyramid" to the center)

            var nbLevels = zooms.length - 1;
            var hSteps = width / 2 / nbLevels;
            var vSteps = height / 2 / nbLevels;

            // levels disappear one by one as the mouse moves closer to the center
            this.wrapperElement.addEventListener('mousemove', function (e) {
                // find the relative coordinates of the mouse in the widget
                var rect = _this3.wrapperElement.getBoundingClientRect();
                var relX = e.clientX - rect.left - _this3.wrapperElement.clientLeft;
                var relY = e.clientY - rect.top - _this3.wrapperElement.clientTop;

                // normalize values so that only the first quadrant has to be tested
                if (relX > width / 2) {
                    relX = width - relX;
                }
                if (relY > height / 2) {
                    relY = height - relY;
                }
                // find the zoom, by finding the inner-most zone the cursor is in
                var pane = Math.min(Math.floor(relX / hSteps), Math.floor(relY / vSteps)) + 1;
                if (pane !== _this3.state.visiblePane) {
                    _this3.setState({ visiblePane: pane });
                }
            });
            // the first level will disappear as soon as the mouse enters the element,
            // make it reappear when it leaves
            this.wrapperElement.addEventListener('mouseout', function (e) {
                _this3.setState({ visiblePane: 0 });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var imgUrls = this.buildImageUrls();
            var panes = imgUrls.map(function (url, i) {
                return _react2.default.createElement('div', {
                    key: i,
                    className: 'staticMapZoom-zoomPane',
                    style: Object.assign({
                        backgroundImage: 'url(' + url + ')',
                        opacity: i < _this4.state.visiblePane ? 0 : 1
                    }, paneStyle)
                });
            });
            panes.reverse();

            var containerClasses = 'staticMapZoom ' + (this.props.reticle ? 'staticMapZoom-reticle' : '');
            var containerAttributes = {
                className: containerClasses,
                ref: function ref(_ref) {
                    _this4.wrapperElement = _ref;
                },
                style: Object.assign({
                    height: this.props.height + 'px',
                    width: this.props.width + 'px'
                }, containerStyle)
            };

            if (this.props.href) {
                return _react2.default.createElement(
                    'a',
                    _extends({ href: this.props.href }, containerAttributes),
                    panes
                );
            }

            return _react2.default.createElement(
                'div',
                containerAttributes,
                panes
            );
        }
    }]);

    return StaticMapZoom;
}(_react2.default.Component);

StaticMapZoom.propTypes = {
    center: _react.PropTypes.shape({
        lat: _react.PropTypes.number.isRequired,
        lng: _react.PropTypes.number.isRequired
    }).isRequired,
    zooms: _react.PropTypes.arrayOf(_react.PropTypes.number),
    provider: _react.PropTypes.oneOf(Object.keys(_staticMapProviders2.default)),
    apiKey: _react.PropTypes.string,
    width: _react.PropTypes.number,
    height: _react.PropTypes.number,
    href: _react.PropTypes.string,
    reticle: _react.PropTypes.bool
};
StaticMapZoom.defaultProps = {
    zooms: [3, 6, 14],
    provider: 'google',
    width: 500,
    height: 250,
    href: null,
    reticle: false
};
exports.default = StaticMapZoom;
module.exports = exports['default'];
//# sourceMappingURL=StaticMapZoom.js.map