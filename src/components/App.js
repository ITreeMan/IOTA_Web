import React, { Component } from 'react';
import ReactGA from 'react-ga';
import queryString from 'query-string';
import QRCode from 'qrcode';
import { fetch } from '../utils/MAM';
import List from './List';
import Loader from './Loader';
import Header from './Header';
import Footer from './Footer';
import Form from './Form';
import Disclaimer from './Disclaimer';

const App = () => {
    const [state, setState] = React.useState({
        messages: [],
        showLoader: false,
        qrcode: null
    })

    const appendToMessages = message => setState((prev) => ({
        ...prev,
        messages: [...prev.messages, message]
    }));

    const fetchComplete = () => setState((prev) => ({
        ...prev,
        showLoader: false,
    }));

    const generateQR = async (root, provider, mode, key = null) => {
        try {
            let url = `${window.location.origin}/?provider=${provider}&mode=${mode}&root=${root}`;
            url = key ? `${url}&key=${key}` : url;
            return await QRCode.toDataURL(url);
        } catch (err) {
            console.error(err);
        }
    }

    const onSubmit = async ({ provider, root, mode, key }) => {
        if (this.state.showLoader) return;
        const qrcode = await this.generateQR(root, provider, mode, key);
        setState((prev) => ({
            ...prev,
            showLoader: true,
            messages: [], 
            qrcode
        }));
        ReactGA.event({
            category: 'Fetch',
            action: 'MAM Fetch',
            label: `Provider ${provider}, mode: ${mode}`
        });
        fetch(provider, root, mode, key, this.appendToMessages, this.fetchComplete);
    };

    React.useEffect(() => {
        if (window.location.search) {
            this.onSubmit(queryString.parse(window.location.search));
        }
    }, [])

    return (
        <div className="app">
            <Header qrcode={state.qrcode} />
            <div className="content">
                <Form onSubmit={onSubmit} showLoader={state.showLoader} />
                <div className={`loaderWrapper ${state.showLoader ? '' : 'hidden'}`}>
                    <Loader showLoader={state.showLoader} />
                </div>
                {state.messages.length > 0 ? <List messages={state.messages} /> : null}
            </div>
            <Disclaimer />
            <Footer />
        </div>
    );

}

export default App;
