from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import Match, FriendRequest

@csrf_exempt
def send_invite(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        invitee_username = data.get('invitee')

        try:
            invitee = User.objects.get(username=invitee_username)
            sender = request.user  # Assume que o usuário está autenticado

            # Verifique se já existe um convite pendente
            if FriendRequest.objects.filter(sender=sender, invitee=invitee, accepted=False).exists():
                return JsonResponse({'message': 'Invite already sent'}, status=400)

            # Crie um novo convite
            FriendRequest.objects.create(sender=sender, invitee=invitee, accepted=False)
            return JsonResponse({'message': 'Invite sent successfully'})

        except User.DoesNotExist:
            return JsonResponse({'message': 'Invitee not found'}, status=404)

    return JsonResponse({'message': 'Invalid request method'}, status=405)
