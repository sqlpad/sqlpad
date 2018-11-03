import { Container } from 'unstated'

class ModalContainer extends Container {
  state = {
    visible: false,
    title: ''
  }

  show = title => this.setState({ visible: true, title })

  close = () => this.setState({ visible: false, title: '' })
}

export default ModalContainer
