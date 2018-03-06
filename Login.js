import React, { Component } from 'react';
import {  View, Text, Image, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import PPF from 'PPFmobile/app/api/PPFIntegration';
import Container from 'PPFmobile/app/layout/Container';
import { LayoutStyle, Type, UI, Colors } from 'PPFmobile/app/styles/Styles';
import { PPFButton } from 'PPFmobile/app/layout/UI';
import Errors from 'PPFmobile/app/Errors';

export default class Login extends Component {

	constructor(){
		super();
		this.state = {
			login: null,
			password: null,
		}
		this.inputs = {};
	}

	async login(){
		Keyboard.dismiss();
		this.setState({busy: true});
		if( !this.state.login || !this.state.password ){
			this.setState({busy: false});
			Alert.alert(Errors.login.incorrect.title, Errors.login.incorrect.body);
			return;
		}
		PPF.cleanRealm();
		try{
			await PPF.login(this.state.login, this.state.password)
			this.setState({busy: false});
			this.props.screenProps.onLogIn();
		} catch(e){
			this.setState({busy: false});
			switch(e.code){
				case 11:
					Alert.alert(Errors.login.notFound.title, Errors.login.notFound.body);
					break;
				default:
					Alert.alert(Errors.login.failed.title, Errors.login.failed.body); 
					break;
			}
		}
	}

	focusField(field){
		this.inputs[field].focus();
	}

	render() {
		return (
			<Container {...this.props} 
				busy={this.state.busy} 
				navigateTo={this.state.navigateTo}
				navigateProps={this.state.navigateProps}>

				<View style={LayoutStyle.bannerContainer}>
					<Image source={require('PPFmobile/app/img/mainbg.png')} style={LayoutStyle.banner} />
				</View>

				<View style={[LayoutStyle.contentNarrow, LayoutStyle.valignCenter]}>
					<Text style={[Type.h1, Type.center]}>
						Личный кабинет
					</Text>
					<TextInput style = {UI.input}
						ref={input => {this.inputs['login'] = input}}
						underlineColorAndroid = "transparent"
						placeholder = "Логин"
						placeholderTextColor = {Colors.darkGrey}
						autoCapitalize = "none"
						onChangeText = {(text) => {this.setState({login: text})}}
						onSubmitEditing={() => {this.focusField('password')}}
						//blurOnSubmit={false} //FIXED IN RN 0.50+
						returnKeyType={'next'}
					/>
					<TextInput style = {UI.input}
						ref={input => {this.inputs['password'] = input}}
						underlineColorAndroid = "transparent"
						placeholder = "Пароль"
						placeholderTextColor = {Colors.darkGrey}
						autoCapitalize = "none"
						secureTextEntry = {true}
						onChangeText = {(text) => {this.setState({password: text})}}
						onSubmitEditing={() => {this.login()}}
						blurOnSubmit={ true }
						returnKeyType={'done'}
					/>
					<PPFButton onPress={() => {this.login()}} disabled={this.state.busy}>Вход</PPFButton>
					<View style={LayoutStyle.gap10}></View>
					<TouchableOpacity 
						disabled={this.state.busy}
						onPressIn={()=>this.setState({navigateTo:'PasswordRecover'})}>
						<Text style = {[Type.center, Type.p, Type.link, Type.underline]}>
							Восстановить пароль
						</Text>
					</TouchableOpacity>
				</View>
			</Container>
		);
	}
}