import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f8fa',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e3eaff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#e3eaff',
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#23242a',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 30,
    shadowColor: '#2563eb',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 7,
  },
  input: {
    height: 48,
    borderWidth: 1.3,
    borderColor: '#e3eaff',
    borderRadius: 9,
    marginBottom: 18,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#23242a',
    backgroundColor: '#f9fbff',
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
 eyeIcon: {
  position: 'absolute',
  right: 12,
  top: '50%',
  marginTop: -24,
  zIndex: 10,
},

  button: {
    backgroundColor: '#2563eb',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.03,
  },
  links: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 24,
},
link: {
  color: '#2563eb',
  fontWeight: '700',
  fontSize: 15,
  letterSpacing: 0.02,
},

});
