import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { UI, LayoutStyle, Type, Colors, ContractStyle } from 'PPFmobile/app/styles/Styles';
import Svg, { 
	Circle, Ellipse, G, LinearGradient, RadialGradient, Line, Path, Polygon, 
	Polyline, Rect, Symbol, Use, Defs, Stop 
} from 'react-native-svg';
import ArrowSvg from 'PPFmobile/app/img/svg/Arrow.svg.js';
import CrossSvg from 'PPFmobile/app/img/svg/Cross.svg.js';
import RubSvg from 'PPFmobile/app/img/svg/Rub.svg.js';
import Modal from 'react-native-modalbox';
const SvgText = Svg.Text;

export function moneyFormat(n) {
	return n
	? parseFloat(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ").replace('.', ',')
	: null
}

export class Rubble extends Component {
	render(){
		var color, labelStyle = null, textStyle = null;
		if(this.props.label){
			color = Colors.white;
			labelStyle = Type.currLabel;
			textStyle = [Type.bold, Type.white];
		} else {
			color = this.props.color || Colors.black;
			textStyle = {color:color};
		}
		return(
			<View style={[{flexDirection: 'row', flexWrap:'wrap'}, labelStyle]}>
				<Text style={[Type.p, textStyle, {paddingRight: 5}]}>{this.props.children}</Text>
				<View style={{paddingTop:5}}>
					<RubSvg color={color} height={this.props.curSize}/>
				</View>
			</View>
		);
	}
}

export class LabeledCaption extends Component {
	render() {
		var gap = this.props.gap != undefined ? this.props.gap : 10;
		var image;
		if(this.props.imageSource){
			image = <Image source={this.props.imageSource} style={this.props.imageStyle || null}/>
		}
		if(this.props.image){
			image = this.props.image;
		}

		var positionLeft = (
			<View style={[{flexDirection: 'row', alignItems: 'center'}, this.props.style || null]}>
				{image}
				<View style={{flex: 1, paddingLeft: gap, alignItems:this.props.align || 'flex-start'}}>
					{this.props.children}
				</View>
			</View>
		);

		var positionRight = (
			<View style={[{flexDirection: 'row', alignItems: 'center'}, this.props.style || null]}>
				<View style={{flex: 1, paddingRight: gap, alignItems:this.props.align || 'flex-start'}}>
					{this.props.children}
				</View>
				{image}
			</View>
		);

		switch(this.props.imgPosition){
			case 'left': return positionLeft; break;
			case 'right': return positionRight; break;
			default: return positionLeft; break;
		}
	}
}

export class PPFButton extends Component {
	render() {
		return (
			<TouchableOpacity {...this.props} style = {UI.button}>
				<Text style = {UI.buttonLabel}>{this.props.children.toUpperCase()}</Text>
			</TouchableOpacity>
		);
	}
}

export class PPFButton2 extends Component {
	constructor(){
		super();
		this.state={ 
			width: 0,
			widthCalculated: false,
			onLayoutCalls: 0,
		}
	}

	onLayout = (event) => {
		if(this.state.widthCalculated){return;}
		let w = event.nativeEvent.layout.width
		this.setState((prevState) => { 
			return prevState.onLayoutCalls < 2 ? {
				width: prevState.width + w,
				onLayoutCalls: prevState.onLayoutCalls + 1,
				widthCalculated: false
			} : {
				width: prevState.width + w,
				onLayoutCalls: prevState.onLayoutCalls + 1,
				widthCalculated: true
			}
		});
	}

	getBg(){
		if(!this.state.widthCalculated){ return null; }
		let w = this.state.width > 0 ? this.state.width : 1;
		let h = 50, r = 7;
		return (
			<Svg width={w} height={h} viewBox={"0 0 "+w+" "+h} style={UI.button2Bg}>
				<Path fill="#FFFFFF" d={"M3.499,0c0,0,"+(w-r)+",0,"+(w-r)+",0c1.933,0,3.5,1.567,3.5,3.5c0,0.348-0.053,0.683-0.146,1l-9.813,32.924c-0.404,1.485-1.763,2.577-3.376,2.577H3.5C1.567,40,0,38.433,0,36.5v-33C0,1.567,1.567,0,3.499,0z"}/>
			</Svg>
		)
	}

	render(){
		var { widthCalculated, width } = this.state;
		var style = widthCalculated ? {width:width} : {};
		return (
			<TouchableOpacity 
				style = {[UI.button2, style]}
				onPress={()=>this.props.onPress()}>				
				<View style={UI.button2IconContainer} onLayout={this.onLayout}>
					{this.props.image}
				</View>
				<Text style={UI.button2Label} onLayout={this.onLayout}>
					{this.props.children.toUpperCase()}
				</Text>
				<View style = {UI.btn2ArrowContainer} onLayout={this.onLayout}>
					<ArrowSvg height={14}/>					
				</View>
				{this.getBg()}
			</TouchableOpacity>
		);
	}
}

export class PPFModal extends Component {
	open(){
		this.refs.modal.open();
	}

	render(){
		//Фикс бага на Android 4 - в модальном окне не работает скролл,
		//т.к. не воспринимается свойство contentContainerStyle
		//в <ScrollView contentContainerStyle={{flex:1}}>.
		//Без этого свойства невозможно автоматически рассчитать 
		//высоту WebView на экране оплаты.
		var SVProps = (Platform.OS === 'android') && Platform.Version == 16
			? null
			: {contentContainerStyle: {flex:1}};

		return(
			<Modal
				ref={"modal"}
				backdropColor={'white'}
				backdropOpacity={1}
				backButtonClose={true}
				swipeToClose={false}>
				<View style={UI.modal}>
					<View style={[UI.header]}>
						<Text style={[Type.h1, UI.headerCaption]}>{this.props.header}</Text>
						<TouchableOpacity onPress={()=>this.refs.modal.close()} style={UI.closeBtn}>
							<CrossSvg fill={Colors.orange} diameter={25}/>
						</TouchableOpacity>
					</View>
					<ScrollView {...SVProps}>
						<View style={!this.props.fullWidth ? UI.modalContent : {flex:1} }>
							{this.props.children}
						</View>
					</ScrollView>
				</View>
			</Modal>
		);
	}
}

class Letter extends Component{
	render(){
		return (
			<Text style={[this.props.textStyle, {marginRight:this.props.spacing}]}>
					{this.props.children}
			</Text>
		);
	}
}

export class TextWithLetterSpacing extends Component {
	spacingForLetterIndex = (letters, index, spacing) => (letters.length - 1 === index) ? 0 : spacing;

	render(){		
		let letters = this.props.children.split('');
		return <View style={[{flexDirection:'row', alignItems:'center', justifyContent:'center'}, this.props.viewStyle]}>
			{letters.map((letter, index) =>
				<Letter 
					key={index} 
					spacing={this.spacingForLetterIndex(letters, index, this.props.spacing)} 
					textStyle={this.props.textStyle}>
					{letter}
				</Letter>
			)}
		</View>

	}
}

class BgInner extends Component{
	render(){
		var w = this.props.width || Dimensions.get('window').width*2/3;
		var h = this.props.height || 170;

		if(w < 50){w = 50;}

		var startColor = this.props.startColor || 'rgb(13,77,255)';
		var endColor = this.props.endColor || 'rgb(24,123,255)';
		return(
			<Svg height={h} width={w}>
				<Defs>
					<LinearGradient id="grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={w} y2="0">
						<Stop offset="0" stopColor={startColor}/>
						<Stop offset="1" stopColor={endColor}/>
					</LinearGradient>
				</Defs>
				<Polygon fill="url(#grad)" points={`${w},0 ${w-50},${h} 0,${h} 0,0`}/>
			</Svg>
		);
	}
}

export class ContractBackground extends Component{
	render(){
		return(
			<View>
				<View style={ContractStyle.contract}>
					<View style={ContractStyle.bgInnerContainer}>
						<BgInner 
							startColor={this.props.startColor}
							endColor={this.props.endColor}
						/>
					</View>
					{this.props.children}
					<View style={ContractStyle.productImageContainer}>
						<Image 
							source={this.props.productImage} 
							style={[ContractStyle.productImage, this.props.imgPos]} 
						/>
					</View>
				</View>
			</View>
		)
	}
}

export class FullWidthScrollView extends Component{
	render(){
		return(
			<ScrollView 
				style={{width: '100%'}} 
				contentContainerStyle={{alignItems:'center'}} 
				scrollEnabled={true}>
				{this.props.children}
			</ScrollView>
		)
	}
}
