# remote/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import MatchInvite
from .serializers import MatchInviteSerializer

class MatchInviteViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = MatchInviteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        invite = MatchInvite.objects.get(pk=pk)
        if request.user != invite.receiver:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.data.get('accepted') is not None:
            invite.accepted = request.data['accepted']
            invite.save()
            if invite.accepted:
                # Start a game session
                # ...
                return Response({'detail': 'Invite accepted'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'Invite rejected'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
