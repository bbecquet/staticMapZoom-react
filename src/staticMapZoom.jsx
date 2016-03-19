import React, { PropTypes } from 'react';
import providers from './mapProviders.js';

export default class StaticMapZoom extends React.Component {
    static propTypes = {
        center: PropTypes.array.isRequired,
        zooms: PropTypes.array.isRequired,
        href: PropTypes.string,
        provider: PropTypes.string,
        reticle: PropTypes.bool,
        height: PropTypes.number,
        width: PropTypes.number
    };

    static defaultProps = {
        href: null,
        provider: 'google',
        reticle: false,
        height: 250,
        width: 500
    };

    constructor(props) {
        super(props);
        this.state = {
            visiblePane: 0
        };
    }

    componentDidMount() {
        this.installMouseBehavior();
    }

    componentWillUnmount() {
    }

    // TODO: move it to providers (?)
    buildImageUrls() {
        return this.props.zooms.map((zoom) => {
            const opts = {
                w: this.props.width,
                h: this.props.height,
                lat: this.props.center[0],
                lng: this.props.center[1],
                z: zoom,
                key: '[your_key_here]'
            };
            return providers[this.props.provider](opts);
        });
    }

    installMouseBehavior() {
        const {
            height,
            width,
            zooms
        } = this.props;

        // computes coordinates of zones reacting to mouse events (i.e. the "pyramid" to the center)
        const nbLevels = zooms.length - 1;
        const hSteps = (width / 2) / nbLevels;
        const vSteps = (height / 2) / nbLevels;

        // levels disappear one by one as the mouse moves closer to the center
        this.wrapperElement.addEventListener('mousemove', e => {
            // find the relative coordinates of the mouse in the widget
            let relX = e.clientX - this.wrapperElement.offsetLeft;
            let relY = e.clientY - this.wrapperElement.offsetTop;
            // normalize values so that only the first quadrant has to be tested
            if (relX > width / 2) {
                relX = width - relX;
            }
            if (relY > height / 2) {
                relY = height - relY;
            }
            // find the zoom, by finding the inner-most zone the cursor is in
            const pane = Math.min(Math.floor(relX / hSteps), Math.floor(relY / vSteps)) + 1;
            this.setState({ visiblePane: pane });
        });
        // the first level will disappear as soon as the mouse enters the element,
        // make it reappear when it leaves
        this.wrapperElement.addEventListener('mouseout', e => {
            this.setState({ visiblePane: 0 });
        });
    }

    render() {
        const imgUrls = this.buildImageUrls();
        imgUrls.reverse();
        const panes = imgUrls.map((url, i) =>
            <div
                key={i}
                className="staticMapZoom-zoomPane"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transition: 'opacity 0.2s ease',
                    backgroundSize: '100%',
                    backgroundImage: `url(${url})`,
                    opacity: (i > this.state.visiblePane) ? 0 : 1
                }}
            />
        );
        const classes = `staticMapZoom ${this.props.reticle ? 'staticMapZoom-reticle' : ''}`;

        if (this.props.href) {
            return <a href={this.props.href}
                className={classes}
                ref={(ref) => {this.wrapperElement = ref;}}
                style={{
                    height: `${this.props.height}px`,
                    width: `${this.props.width}px`
                }}
            >
                { panes }
            </a>;
        }

        return <div
            className={classes}
            ref={(ref) => {this.wrapperElement = ref;}}
            style={{
                height: `${this.props.height}px`,
                width: `${this.props.width}px`
            }}
        >
            { panes }
        </div>;
    }
}