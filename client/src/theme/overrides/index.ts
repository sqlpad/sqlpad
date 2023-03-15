import { Theme } from "@mui/material/styles"
//
import Fab from "./Fab"
import Card from "./Card"
import Chip from "./Chip"
import Tabs from "./Tabs"
import Menu from "./Menu"
import Link from "./Link"
import Lists from "./List"
import Table from "./Table"
import Alert from "./Alert"
import Badge from "./Badge"
import Paper from "./Paper"
import Input from "./Input"
import Radio from "./Radio"
import Drawer from "./Drawer"
import Dialog from "./Dialog"
import Avatar from "./Avatar"
import Rating from "./Rating"
import Slider from "./Slider"
import Button from "./Button"
import Switch from "./Switch"
import Select from "./Select"
import SvgIcon from "./SvgIcon"
import Tooltip from "./Tooltip"
import Popover from "./Popover"
import Stepper from "./Stepper"
import DataGrid from "./DataGrid"
import Skeleton from "./Skeleton"
import Backdrop from "./Backdrop"
import Progress from "./Progress"
import Timeline from "./Timeline"
import TreeView from "./TreeView"
import Checkbox from "./Checkbox"
import Accordion from "./Accordion"
import Typography from "./Typography"
import Pagination from "./Pagination"
import Breadcrumbs from "./Breadcrumbs"
import ButtonGroup from "./ButtonGroup"
import Autocomplete from "./Autocomplete"
import ToggleButton from "./ToggleButton"
import ControlLabel from "./ControlLabel"
import LoadingButton from "./LoadingButton"

// ----------------------------------------------------------------------

export default function ComponentsOverrides(theme: Theme) {
  return Object.assign(
    Fab(theme),
    Tabs(theme),
    Chip(theme),
    Card(theme),
    Menu(theme),
    Link(),
    Input(theme),
    Radio(theme),
    Badge(),
    Lists(theme),
    Table(theme),
    Paper(),
    Alert(theme),
    Switch(theme),
    Select(),
    Button(theme),
    Rating(theme),
    Dialog(theme),
    Avatar(theme),
    Slider(theme),
    Drawer(theme),
    Stepper(theme),
    Tooltip(theme),
    Popover(theme),
    SvgIcon(),
    Checkbox(theme),
    DataGrid(theme),
    Skeleton(theme),
    Timeline(theme),
    TreeView(theme),
    Backdrop(theme),
    Progress(theme),
    Accordion(theme),
    Typography(theme),
    Pagination(theme),
    ButtonGroup(theme),
    Breadcrumbs(theme),
    Autocomplete(theme),
    ControlLabel(theme),
    ToggleButton(theme),
    LoadingButton()
  )
}
