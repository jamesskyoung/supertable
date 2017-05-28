import React from 'react';

class CountdownForm extends React.Component {
    onSubmit(e) {
        e.preventDefault();
        var secondsStr = this.refs.seconds.value;

        if (secondsStr.length > 0 && secondsStr.match(/^[0-9]*$/)) {
            this.refs.seconds.value = '';
            this.props.onSetCountdownTime(parseInt(secondsStr, 10));
        }
    }
    componentWillMount() {
        console.log( 'Component will mount...' );
        var flag= false;
        if ( flag ) {
            console.log( flag );
        }
    }
    render() {
        return (
            <div>
                <form ref="form" onSubmit={this.onSubmit.bind(this)} className="countdown-form">
                    <input type="text" ref="seconds" placeholder="Enter time in seconds"/>
                    <input type="submit" className="button success expanded" value="Start Countdown"/>
                </form>
            </div>
        );
    }
}

export default CountdownForm;
