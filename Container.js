import React, { Component } from 'react';
import { 
	Text, View, StatusBar, Platform, Keyboard, Animated, TouchableWithoutFeedback
} from 'react-native';
import Loader from './Loader';
import Menu from './Menu';
import Header from './Header';
import { LayoutStyle, UI } from 'PPFmobile/app/styles/Styles';
import { PPFModal } from './UI';
import Modal from 'react-native-modalbox';

// Цикл работы
// 
// Компонент передает в качестве props navigateTo: screen.
// Container отлавливает его в componentWillReceiveProps.
// Если navigateTo не пустое, готовимся 
// заблокировать кнопки this.state.this.buttonsLocked = true.
// Компонент мог передать busy: true.
// В таком случае в componentWillReceiveProps устанавливаем this.state.busy = true.
// В этом случая также блокируем кнопки.
// 
// Далее происходит отрисовка render с запущенным Loader, если this.state.busy = true.
// Запускается componentDidUpdate. 
// Очищаем this.state.navigateTo и this.state.navigateProps.
// Выполняем переход на новый экран (navigate).
// 
// По окончании перехода навигатов вызовет внутри себя (см. компонент App.js)
// this.onTransitionEnd, которая выключит Loader и включит кнопки.

/**
 * @brief      props:
 *        - navigation
 *        - navigateTo
 *        - navigateProps
 *        - busy
 */
export default class Container extends Component {
	constructor(props){
		super(props);
		this.state = {
			busy: this.props.busy || false,
			buttonsLocked: false,			
			navigateTo: this.props.navigateTo || null,
			navigateProps: this.props.navigateProps || {},
			activeScreen: this.props.navigation.state.routeName,
			keyboardOffset: new Animated.Value(0),
			TWFDisabled: true
		}
	}

	// Поднимаем экран при появлении клавиатуры 
	// (штатный KeyboardAvoidingView работает как то криво и непонятно)
	componentWillMount(){
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
	}

	componentWillUnmount () {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	_keyboardDidShow = (e) => {
		let offset = -e.endCoordinates.height + 110;
		//this.setState({TWFOnPressHandler: this.TWFOnPressHandler})
		this.setState({TWFDisabled: false});
		Animated.timing( this.state.keyboardOffset, {toValue: offset, duration: 200} ).start()
	}

	_keyboardDidHide = () => {
		this.setState({TWFDisabled: true});
		Animated.timing( this.state.keyboardOffset, {toValue: 0, duration: 200} ).start()
	}

	// Блокировать кнопки в случае если
	// - была нажата любая кнопка перехода
	// 		Кнопка может быть нажата двумя способами
	// 		- из меню, непосредственным вызовом метода this.navigate
	// 		- из компонента посредством {navigateTo: screen}, который в конечном счете 
	// 		тоже вызывает this.navigate
	// - был намеренно установлен {busy: true}
	// 
	// {busy:true} устанавливает либо компонент, 
	// либо нажатие по кнопке меню Notifications
	// 
	// Разблокировать все кнопки по окончанию перехода onTransitionEnd

	componentWillReceiveProps(nextProps){
		this.setState({
			busy: nextProps.busy || false, 
			navigateTo: nextProps.navigateTo || null,
			navigateProps: nextProps.navigateProps || {},
		});
	}

	componentDidUpdate(prevProps, prevState){
		if(this.state.navigateTo){
			var screen = this.state.navigateTo;
			var navigateProps = this.state.navigateProps;
			this.setState({
				navigateTo: null, 
				navigateProps: {}, 
			});
			this.navigate(screen, navigateProps);
		}
		if(prevState.contentHeight != this.state.contentHeight){
			this.props.screenProps.updateContentHeight(this.state.contentHeight);
		}
	}

	navigate = (screen, navigateProps = null) => {
		if(this.state.buttonsLocked || this.state.busy){ return; }
		this.setState({buttonsLocked: true})
		if(
			this.state.activeScreen == 'Contract'
			&& screen == 'ContractList'
		){
			this.props.navigation.goBack();
		} else {
			this.props.navigation.navigate(screen, navigateProps);
		}

	}

	toggleStatusBar(){
		this.isNoHeaderPage() ? this.noAuthStatusBar() : this.authStatusBar();
	}

	isNoHeaderPage(){
		return ['Login', 'SignUp', 'PasswordRecover'].indexOf(this.state.activeScreen) !== -1
	}

	authStatusBar(){
		if ((Platform.OS === 'android')){
			StatusBar.setBackgroundColor('rgba(0,0,0, 0)');
			StatusBar.setBarStyle('light-content');
			StatusBar.setTranslucent(true);
			StatusBar.setHidden(false);
		}
		if ((Platform.OS === 'ios')){
			StatusBar.setHidden(false);
			StatusBar.setBarStyle('light-content');
		}
	}

	noAuthStatusBar(){
		StatusBar.setHidden(true);
	}

	onDidFocus = (payload) => {
		this.setState({
			buttonsLocked: false,
			busy: false,
			activeScreen: payload.state.routeName
		});
	}

	componentDidMount(){
		const { navigation } = this.props;
		this.toggleStatusBar();		
		navigation.addListener( 'didFocus', this.onDidFocus  );
	}

	/**
	 * Обработчик onPress для TouchableWithoutFeedback в качестве его props. Если
	 * клавиатура на экране, вешаем обработчик. В противном случае, обработчик
	 * устанавливается в null. Это решает проблему, когда конфликтует обработка
	 * нажания на экран внутри ScrollView и TouchableWithoutFeedback в результате
	 * чего скролл срабатывает через раз.
	 */
	TWFOnPressHandler(){
		Keyboard.dismiss();
	}

	render() {
		var { buttonsLocked, busy, activeScreen, keyboardOffset, TWFDisabled } = this.state;
		var { updateNewNotifsCount, notifCount, onLogOut, isLoggedIn } = this.props.screenProps;
		return (
			<TouchableWithoutFeedback disabled={TWFDisabled} onPress={Keyboard.dismiss}>
				<Animated.View style={[{top: keyboardOffset}, LayoutStyle.container]}>
					{(()=>{
						return this.isNoHeaderPage()
							? null
							: <Header
								updateNewNotifsCount={updateNewNotifsCount}
								notifCount={notifCount}
								navigate={this.navigate}
								onLogOut={onLogOut}
								auth={isLoggedIn}
								buttonsLocked={buttonsLocked}
							/>
					})()}				
					{this.props.children}
					<Menu
						navigate={(screen, navigateProps) => {
							this.setState({
								navigateTo:screen, 
								navigateProps:navigateProps
							})
						}} 
						activeScreen={activeScreen}
						auth={isLoggedIn}
						buttonsLocked={buttonsLocked}
					/>
					<Loader visible={busy}/>
				</Animated.View>
			</TouchableWithoutFeedback>
		);
	}
}