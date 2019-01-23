import React from 'react';
import { Text, View, FlatList,TouchableOpacity,ActivityIndicator, Button, Image ,TouchableHighlight,StyleSheet} from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation';
import { Camera, Permissions ,ImagePicker} from 'expo';

class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: Camera.Constants.Type.back,
    image: null,
    tocken: null,
    bDisable: true
  };
  



  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const { status1 } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: status === 'granted' });
    this.setState({ hasCameraRollPermission: status1 === 'granted' });
    
    fetch('https://p1940716207trial.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials',
    
      {
        headers: {
          Accept: 'application/json',
          'Authorization': 'Basic c2ItZjViZTcwYWUtZDQ0Yi00OThiLWE4ZjMtODdmMzI0ZDYxMjI1IWI5Njk1fGZvdW5kYXRpb24tc3RkLW1sZnRyaWFsIWIzNDEwOmd2MWJ6SnJrVkZsKzBOYUplbS9YWnlaalc2OD0=',
         
        
        },

      }
    
    )
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({
        
        tocken: 'Bearer ' +responseJson.access_token,
      }, function(){

      });

    })
    .catch((error) =>{
      console.error(error);
    });

  }

  render() {
    let { image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Pick an image from camera roll"
          onPress={this._pickImage}
        />
        {image &&
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <Button
          title="Take Picture"
          onPress={this._TakePhoto}
        />

      <TouchableHighlight disabled={this.state.bEnable} style={styles.captureButton} >
				<Button disabled={this.state.bDisable} style={styles.captureButton} title="Submitt" color="#841584" onPress={this.onsubmit}/>
			</TouchableHighlight> 
      </View>
    );
  }

  
   _pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({ image: result.uri });
        this.setState({ bDisable: false});
      }
    };

    _TakePhoto = async () => {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });
  
      console.log(result);
  
      if (!result.cancelled) {
        this.setState({ image: result.uri });
        this.setState({ bDisable: false});
      }
    };

    

    onsubmit=() => {
      this.props.navigation.navigate('Details', {
        state: this.state,
        
      });
    }

  
}

class DetailsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state ={ isLoading: true,
      tocken:null,
    }
  }

  componentDidMount(){
    const { navigation } = this.props;
    const parem = navigation.getParam('state');
    const cleanURL = parem.image.replace("file://", "");
    

   
    var formdata = new FormData(); 
    let uriParts = parem.image.split('.');
  let fileType = uriParts[uriParts.length - 1];

    formdata.append('files', {uri: parem.image, name: 'photo.'+fileType, type: 'image/'+fileType})


    return fetch('https://mlftrial-image-classifier.cfapps.eu10.hana.ondemand.com/api/v2/image/classification/models/Zipengswegbreak1/versions/1',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Authorization': parem.tocken,
          
        
        },
        body: formdata,
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          isLoading: false,
          dataSource: responseJson.predictions[0].results,
        }, function(){

        });

      })
      .catch((error) =>{
        console.error(error);
      });
  }


  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }

    return(
      <View style={{flex: 1, paddingTop:20}}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({item}) => <Text>{item.label}, {item.score}</Text>}
          
        />
        <TouchableHighlight  style={styles.captureButton} >
				<Button  style={styles.captureButton} title="Back"  onPress={this.onGoback}/>
			</TouchableHighlight>
      </View>
    );

    
  } 
  
  onGoback=() => {
    this.props.navigation.navigate('Home')
  }
  
}



const styles = StyleSheet.create({
	captureButton: {
		position: 'absolute',
    bottom:0,
    right:0,
	}
});

const AppNavigator = createStackNavigator({
  Home: {
    screen: CameraExample,
  },
  Details: {
    screen: DetailsScreen,
  },
}, {
    initialRouteName: 'Home',
});

export default createAppContainer(AppNavigator);