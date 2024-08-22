from django.db import models
from django.contrib.auth.models import User

class MatchInvite(models.Model):
    sender = models.ForeignKey(User, related_name='sent_invites', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_invites', on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Invite from {self.sender.username} to {self.receiver.username}"
