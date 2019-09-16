import PropTypes from 'prop-types';
import { Absolute, Flex, Label, Relative, Text } from 'rebass';

import InputWithCustomStyles from './styled/InputWithCustomStyles';
import ButtonSaveStyles from './styled/ButtonSaveStyles';

const CustomInput = ({
  forceError,
  input: { onChange, value } = {},
  input,
  id,
  isValid,
  label,
  meta: { pristine, visited },
  placeholder = '',
  required,
  showLabel = true,
  saveButton,
  onSave
}) => {
  return (
    <Flex flexDirection={'column'} flex={1}>
      {showLabel && (
        <Label mt={10}>
          <Text>{label ? label : placeholder}</Text>
          {required && (
            <Relative top={7}>
              <Absolute left={5} bottom={0}>
                *
              </Absolute>
            </Relative>
          )}
        </Label>
      )}
      <Flex>
        <InputWithCustomStyles
          id={id}
          {...input}
          isvalid={
            (pristine && !visited && !forceError) || isValid ? 'isvalid' : ''
          }
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          value={value}
          required={required}
        />
        {saveButton && (
          <ButtonSaveStyles bg="#8BC34A" onClick={() => onSave()}>
            Save
          </ButtonSaveStyles>
        )}
      </Flex>
    </Flex>
  );
};

CustomInput.propTypes = {
  forceError: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.object,
  isValid: PropTypes.bool,
  label: PropTypes.string,
  meta: PropTypes.object,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  showLabel: PropTypes.bool,
  saveButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onSave: PropTypes.func
};

CustomInput.defaultProps = {
  placeholder: '',
  saveButton: false
};

export default CustomInput;
