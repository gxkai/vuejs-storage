import * as plugin from '../src/install'
import { sessionStorage } from '../src/drivers'
import Vue from 'vue'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.use(plugin)

let vm: any
describe('plugin', () => {
	before(() => {
		window.localStorage.clear()
	})
	it('data should be store as json in localStorage', () => {
		vm = new Vue({
			data: {
				a: 1,
				b: 2,
			},
			storage: {
				namespace: 'vue1',
				keys: ['a'],
			},
		})
		vm.a.should.equal(1)
		JSON.parse(window.localStorage.getItem('vue1')).should.deep.equal({
			a: 1,
		})
	})
	it('data can be change', (done) => {
		vm.a = 2
		vm.a.should.equal(2)
		vm.$nextTick(() => {
			JSON.parse(window.localStorage.getItem('vue1')).should.deep.equal({
				a: 2,
			})
			done()
		})
	})
	it('data will be load from localStorage', () => {
		vm.$destroy()
		vm = new Vue({
			data: {
				a: 1,
				b: 2,
			},
			storage: {
				namespace: 'vue1',
				keys: ['a'],
			},
		})
		vm.a.should.equal(2)
	})
	it('can handle nested key', () => {
		vm.$destroy()
		vm = new Vue({
			data: {
				a: { b: { c: 5 } },
				d: 123,
			},
			storage: {
				namespace: 'vue2',
				keys: ['a.b.c'],
			},
		})
		JSON.parse(window.localStorage.getItem('vue2')).should.deep.equal({
			a: { b: { c: 5 } },
		})
	})
	it('nested key can be change', (done) => {
		vm.a.b.c = 8
		vm.$nextTick(() => {
			JSON.parse(window.localStorage.getItem('vue2')).should.deep.equal({
				a: { b: { c: 8 } },
			})
			done()
		})
	})
	it('can handle object', (done) => {
		vm.$destroy()
		window.localStorage.setItem(
			'vue3',
			JSON.stringify({ a: { b: { c: 4 } } })
		)
		vm = new Vue({
			data: {
				a: { b: { c: 5 } },
			},
			storage: {
				namespace: 'vue3',
				keys: ['a'],
			},
		})
		vm.$nextTick(() => {
			JSON.parse(window.localStorage.getItem('vue3')).should.deep.equal({
				a: { b: { c: 4 } },
			})
			done()
		})
	})
	it('merge fn works', () => {
		vm.$destroy()
		vm = new Vue({
			data: {
				a: { b: { c: 5 } },
			},
			storage: {
				namespace: 'vue3', //merge fn only called if key exists
				keys: ['a'],
				merge: () => ({
					a: 123,
				}),
			},
		})
		vm.a.should.equal(123)
	})
	it('multiple storage', () => {
		vm.$destroy()
		vm = new Vue({
			data: {
				a: 1,
				b: 2,
			},
			storage: [
				{
					namespace: 'vue4',
					keys: ['a'],
				},
				{
					namespace: 'vue4',
					keys: ['b'],
					driver: sessionStorage,
				},
			],
		})
		window.localStorage
			.getItem('vue4')
			.should.equal(JSON.stringify({ a: 1 }))
		window.sessionStorage
			.getItem('vue4')
			.should.equal(JSON.stringify({ b: 2 }))
	})
	it("other state shouldn't be change", () => {
		vm.$destroy()
		vm = new Vue({
			data: {
				a: 1,
				b: 2,
			},
			storage: {
				namespace: 'vue5',
				keys: ['a'],
			},
		})
		window.localStorage
			.getItem('vue5')
			.should.equal(JSON.stringify({ a: 1 }))
		vm.a.should.equal(1)
		vm.b.should.equal(2)
	})
	it('can use factory function as storage and this is accessible', () => {
		const rand = Math.random().toString()
		vm = new Vue({
			data: {
				a: 1,
				b: 2,
				rand,
			},
			storage() {
				return { namespace: this.rand, keys: ['a'] }
			},
		})
		JSON.parse(window.localStorage.getItem(rand)).should.deep.equal({
			a: 1,
		})
	})
})
