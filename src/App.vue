<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import GamePlayer, { playerProp } from './components/GamePlayer.vue';
import HelloWorld from './components/HelloWorld.vue';

const id: Ref<playerProp["id"]> = ref(3);
const playerType: Ref<playerProp['playerType']> = ref('role');
const actionType: Ref<playerProp['actionType']> = ref('walk');
const index: Ref<playerProp["index"]> = ref(1);
const statusType: Ref<playerProp["statusType"]> = ref('dying');

const caocao: Ref<InstanceType<typeof GamePlayer> | null> = ref(null);
const yuanshao: Ref<InstanceType<typeof GamePlayer> | null> = ref(null);
onMounted(() => {
	setTimeout(() => {
		//caocao.value!.animationData.statusType = 'right';
    console.log(caocao.value!.player);
    console.log(yuanshao.value!.player);
    window.caocao = caocao.value!.player;
    window.yuanshao = yuanshao.value!.player;

    // 控制台test: caocao.attackTo(yuanshao)
	}, 1000);
});

</script>

<template>
	<div>
		<a href="https://vitejs.dev" target="_blank">
			<img src="/vite.svg" class="logo" alt="Vite logo" />
		</a>
		<a href="https://vuejs.org/" target="_blank">
			<img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
		</a>
	</div>
	<HelloWorld msg="Vite + Vue" />

	<GamePlayer ref="caocao" :id="id" :playerType="playerType" :actionType="actionType" :index="index"
							:statusType="statusType" />
	<GamePlayer ref="yuanshao" :id="1" playerType="arm" :actionType="actionType" :index="index"
							statusType="damage" />
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}

.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
