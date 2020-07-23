import React, { createRef } from 'react';
import PlayBox from './PlayBox';
import { message,Layout } from 'antd';
const { Header, Footer, Content } = Layout;

class ShowBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: "",
            isdrop: false
        }
        this.showbox = createRef();
        this.fileinput = createRef();

        this.ondragover = this.ondragover.bind(this);
        this.ondrop = this.ondrop.bind(this);
        this.ondragenterbox = this.ondragenterbox.bind(this);
        this.ondragleavebox = this.ondragleavebox.bind(this);
        this.ondropintobox = this.ondropintobox.bind(this);
        this.loadMyFile = this.loadMyFile.bind(this);
    }

    componentDidMount() {
        document.addEventListener("drop", this.ondrop);
        document.addEventListener("dragover", this.ondragover);
        this.showbox.current.addEventListener("dragenter", this.ondragenterbox);
        this.showbox.current.addEventListener("dragleave", this.ondragleavebox);
        this.showbox.current.addEventListener("drop", this.ondropintobox);
    }

    ondragover(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    ondrop(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    ondragleavebox(e) {
        this.setState({ isdrop: false })
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    ondragenterbox(e) {
        this.setState({ isdrop: true })
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    ondropintobox(e) {
        this.setState({
            isdrop: false
        });
        let file = e.dataTransfer.files[0];
        let names = file.name.split(".");
        if (names[names.length - 1] !== "svga") {
            message.error('no svga');
            return false;
        }
        this.loadMyFile(file);
    }

    loadMyFile(file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.setState({
                file: reader.result
            })
        }
    }

    onClear(){    
        this.fileinput.current.value = "";    
        this.setState({
            file:""
        })
    }

    onChangeFile(e){
        if(this.fileinput.current.value==="") return false;
        let names = e.target.files[0].name.split(".");
        if (names[names.length - 1] !== "svga") {
            message.error('no svga');
            return false;
        }
        this.loadMyFile(e.target.files[0])
    }

    render() {
        return (
            <>
                <Layout className="main">
                    <Layout>
                        <Header>
                           <span className="logo">SVGA TO PNGS</span>
                        </Header>
                        <Content>
                            <div ref={this.showbox} className={`show-box ${this.state.isdrop === true ? 'is-active' : ''}`}>
                                <input ref={this.fileinput} type="file" accept="*.svga" onChange={this.onChangeFile.bind(this)} />
                                {this.state.file === "" ? "" : <PlayBox file={this.state.file} onclear = {this.onClear.bind(this)} />}
                            </div>
                        </Content>
                        <Footer></Footer>
                    </Layout>
                </Layout>

            </>
        );
    }
}

export default ShowBox;