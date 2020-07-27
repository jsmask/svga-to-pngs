import React, { createRef } from 'react';
import { Downloader, Parser, Player } from 'svga.lite';
import { Button, Progress, Table, Tabs, Switch, Slider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import JSZip from 'jszip'
import { saveAs } from 'file-saver';

const { TabPane } = Tabs;

class PlayBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isfirst: true,
            player: null,
            list: [],
            progress: 0,
            custnum: 1,
            columns: [],
            iscust: false,
            colors: ['#000000', '#ffffff', 'rgb(234, 236, 63)', 'rgb(235, 75, 47)', '#596feb', '#b4e93a'],
            colorindex: 0,
            iscreate:true
        }
        this.canvas = createRef();
    }

    componentDidMount() {
        const downloader = new Downloader();
        const parser = new Parser();
        const player = new Player(this.canvas.current);

        this.createTable();

        ; (async () => {

            // this.canvas.current.width = this.canvas.current.clientWidth;
            // this.canvas.current.height = this.canvas.current.clientHeight;

            const fileData = await downloader.get(this.props.file)
            const svgaData = await parser.do(fileData)

            player.set({
                loop: 1,
                fillMode: 'forwards'
            });

            await player.mount(svgaData);

            let obj = player._renderer._bitmapCache;
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const src = obj[key].src;
                    this.setState({
                        list: [...this.state.list, {
                            key: this.state.list.length,
                            name: `img_${this.state.list.length}`,
                            pic: src
                        }]
                    })
                }
            }

            var timer = null;

            player
                .$on('start', () => {
                    this.setState({
                        progress: 0
                    });
                    if(this.state.iscreate){
                        // if(player.videoItem.frames>this.state.list.length&&!this.state.iscust){
                        //     this.createImages();
                        // }
                        if(this.state.iscust){
                            //this.createImages();
                            timer = setInterval(()=>{
                                this.createImages();
                            },player._animator.duration/this.state.custnum);
                        }
                    }
                })
                .$on('pause', () => {                   
                    clearInterval(timer)
                    timer = null;
                })
                .$on('stop', () => {
                    clearInterval(timer)
                    timer = null;
                })
                .$on('end', () => {
                    clearInterval(timer)
                    timer = null;
                })
                .$on('clear', () => {
                    clearInterval(timer)
                    timer = null;
                })
                .$on('process', (e) => {
                    this.setState({
                        progress: player.progress
                    });
                    if(this.state.iscreate&&!this.state.iscust){
                        if(player.videoItem.frames>this.state.list.length){
                            this.createImages();
                        }
                    }
                });

            this.setState({
                player
            });

            //this.state.player.start();

            //console.log(this.state.player)
        })()
    }

    onPlay(){
        this.setState({
            iscreate:false
        });
        setTimeout(() => {
            this.state.player.start();
        }, 200)
    }

    onCreate() {
        this.onPlay();
        this.setState({
            list: [],
            iscreate:true
        });
    }

    createImages() {
        this.setState({
            list: [...this.state.list, {
                key: this.state.list.length,
                name: `img_${this.state.list.length}`,
                pic: this.canvas.current.toDataURL("image/png")
            }]
        });
    }

    callback(key) {
        //console.log(key);
    }

    createTable() {
        this.setState({
            columns: [
                {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                    width: 120,
                },
                {
                    title: 'Image',
                    dataIndex: 'pic',
                    key: 'pic',
                    render: src => (
                        <>
                            <img alt="" src={src} style={{ height: "100px", backgroundColor: `${this.state.colors[this.state.colorindex]}` }} />
                        </>
                    ),
                    width: 180,
                },
                {
                    title: 'Edit',
                    dataIndex: 'key',
                    key: 'key',
                    render: (key, record, index) => (
                        <>
                            <Button onClick={this.onDownLoad.bind(this, key, record, index)} type="primary" style={{ marginRight: "10px" }}>download</Button>
                            <Button onClick={this.onDel.bind(this, key, record, index)} type="primary" danger>delete</Button>
                        </>
                    )
                }
            ]
        });
    }

    onDel(key, record, index) {
        let list = [...this.state.list];
        list.splice(this.getListIndex(record, list), 1);
        this.setState({
            list
        })
    }

    getListIndex(obj,list){
        for (let i = 0; i < list.length; i++) {
            if(obj.key===list[i].key){
                return i;
            }
        }
        return -1;
    }

    onDownLoad(key, record, index) {
        saveAs(record["pic"], `${record["name"]}.png`);
    }

    onClear() {
        this.setState({
            list: [],
            player: null,
            custnum:1
        });
        this.props.onclear();
    }

    onChange() {
        if(this.state.player._animator._isRunning){
            return false;
        }
        this.setState({
            iscust: !this.state.iscust
        })
    }

    onDownloadAll() {
        let zip = new JSZip();
        let img = zip.folder("images");
        this.state.list.forEach(item => {
            img.file(`${item["name"]}.png`, item["pic"].split(',')[1], { base64: true });
        })
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                saveAs(content, "images.zip");
            });
    }

    onChangeColor(index) {
        this.setState({
            colorindex: index
        })
    }

    onChangeSlider(value){
        if(this.state.player._animator._isRunning){
            return false;
        }
        this.setState({
            custnum:value
        })
    }


    render() {
        const { player, progress, columns, list, iscust, custnum, colors, colorindex } = this.state;
        return (
            <>
                <div className="play-box">

                    <Tabs defaultActiveKey="1" onChange={this.callback.bind(this)}>
                        <TabPane tab="Control" key="1">
                            <canvas style={{ backgroundColor: colors[colorindex] }} ref={this.canvas}></canvas>

                            <Progress percent={progress} showInfo={false} style={{ marginTop: "30px" }} />

                            <ul className="play-box-info">
                                <li>
                                    status: {player != null ? (player._animator._isRunning ? 'playing' : 'complete') : 'stop'}
                                </li>
                                <li>
                                    duration: {player != null ? (player._animator.duration + 'ms') : 'null'}
                                </li>
                                <li>
                                    frames: {player != null ? (player.videoItem.frames) : '0'}
                                </li>
                                <li>
                                    {player != null ? (`width: ${player.videoItem.videoSize.width} height: ${player.videoItem.videoSize.height}`) : ""}
                                </li>
                            </ul>

                            <ul className="color-box">
                                {colors.map((item, index) => (<li onClick={this.onChangeColor.bind(this, index)} key={index} style={{ backgroundColor: `${item}` }}></li>))}
                            </ul>

                            <div>
                                <Button type="primary" onClick={this.onPlay.bind(this)} style={{ marginRight: "10px" }} disabled={player && player._animator._isRunning}>Play</Button>
                                <Button type="primary" onClick={this.onCreate.bind(this)} style={{ marginRight: "10px" }} disabled={player && player._animator._isRunning}>Create</Button>
                                <Button type="primary" onClick={this.onDownloadAll.bind(this)} icon={<DownloadOutlined />} style={{ marginRight: "10px" }} disabled={player && player._animator._isRunning}>Download all</Button>
                                <Button type="primary" onClick={this.onClear.bind(this)} disabled={player && player._animator._isRunning} danger>Destroy</Button>
                            </div>

                            {
                                player&&player._animator._isRunning?"":(
                                    <div style={{marginTop: "30px", marginBottom: "30px" }}>
                                        <label>custom：</label> <Switch size="small" defaultChecked={iscust} onChange={this.onChange.bind(this)} />
                                        <Slider onChange={this.onChangeSlider.bind(this)} max={player != null?(player.videoItem.frames):100} min={1} defaultValue={custnum} disabled={!iscust} />
                                    </div>
                                )
                            }


                        </TabPane>

                        <TabPane tab="More" key="2">
                            <Table columns={columns} dataSource={list} />
                        </TabPane>
                    </Tabs>

                </div>
            </>
        );
    }
}

export default PlayBox;