import { Downloader, Parser, Player } from 'svga.lite';
import React, { Component, createRef } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { Input, message, Button } from 'antd';
const { Search } = Input;


class ChangeBese64 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            file: "",
            player:null
        }
        this.onChange = this.onChange.bind(this);
        this.canvas = createRef();
    }

    onChange(value) {
        if (value === '' || value.trim() === '') {
            return false;
        }
        this.createAnimation(value);
        this.setState({
            file: value
        })
    }

    randomString(l) {
        let len = l || 32;
        let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        let maxPos = $chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

   createAnimation(file) {
        const downloader = new Downloader();
        const parser = new Parser();

        ; (async () => {
            let player = null;
            if(this.state.player==null){
                player = new Player(this.canvas.current);
                this.setState({
                    player
                })
            }else{
                player = this.state.player;
            }
            try {
                const fileData = await downloader.get(file);
                const svgaData = await parser.do(fileData);
                player.clear();
                player.set({
                    loop: -1,
                    fillMode: 'forwards'
                });

                await player.mount(svgaData);
                player.start();
            }
            catch{
                this.setState({
                    file: ""
                })
                message.error("error svga")
            }
        })();

    }

    // dataURLtoFile(dataurl, filename) {
    //     let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    //         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    //     while(n--){
    //         u8arr[n] = bstr.charCodeAt(n);
    //     }
    //     return new File([u8arr], filename, {type:mime});
    // }

    onDownload() {
        if (this.state.file === "") return;
        saveAs(this.state.file, `${this.randomString(8)}.svga`);
    }

    render() {
        return (
            <>
                <Search
                    style={{ width: "640px", marginLeft: "27px", marginTop: "30px", marginBottom: "30px" }}
                    placeholder="input base64 text"
                    enterButton="change"
                    size="large"
                    onSearch={this.onChange}
                />
                <div style={{ margin: "30px" }}>
                    <canvas style={{ backgroundColor: "#000000", maxHeight:"480px" }} ref={this.canvas}></canvas>
                </div>
                <Button style={{ marginLeft: "30px" }} disabled={this.state.file === ""} type="primary" icon={<DownloadOutlined />} onClick={this.onDownload.bind(this)} >
                    Download
                </Button>
            </>
        );
    }
}



export default ChangeBese64;