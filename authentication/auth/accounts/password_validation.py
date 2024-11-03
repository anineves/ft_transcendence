from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:

    def validate(self, password, user=None):
        special_character = "@ - _"
        if not any(character.isupper() for character in password):
            raise ValidationError(
                _("This password must contain at least an uppercase character."),
                code="password_has_no_uppercase",
            )
        if not any(character.isdigit() for character in password):
            raise ValidationError(
                _("This password must contain at least a digit."),
                code="password_has_no_digit",
            )
        if not any(character in special_character for character in password):
            raise ValidationError(
                _("This password must contain at least this special characters '@ - _' ."),
                code="password_has_no_specialCharacter",
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least characters."
        )